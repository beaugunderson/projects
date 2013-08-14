var async = require('async');
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var program = require('commander');
var util = require('util');

var config = require('./config.js');
var paths = require('./paths.js');

exports.ensurePathsExist = function () {
  if (process.env.PROJECTS_DIRECTORY) {
    mkdirp.sync(process.env.PROJECTS_DIRECTORY);
  }

  if (!fs.existsSync(paths.CONFIG_BASE)) {
    mkdirp.sync(paths.CONFIG_BASE);
  }
};

var expand = exports.expand = function (string) {
  if (string.substr(0, 1) === '~') {
    string = path.join(paths.HOME, string.substr(1));
  }

  return path.resolve(string);
};

var contract = exports.contract = function (string) {
  if (string.substr(0, paths.HOME.length) === paths.HOME) {
    string = path.join('~', string.substr(paths.HOME.length));
  }

  return path.normalize(string);
};

exports.colorizePath = function (string, opt_colorFn) {
  if (!opt_colorFn) {
    opt_colorFn = chalk.green;
  }

  string = contract(string);

  if (config.projects.directory) {
    var directory = contract(config.projects.directory);

    string = string.replace(new RegExp('^' + directory), chalk.gray(directory));
  }

  var filename = path.basename(string);

  return string.replace(new RegExp(filename + '$'), opt_colorFn(filename));
};

exports.firstTimeSetup = function (cb) {
  async.series([
    function (cbSeries) {
      program.prompt('What\'s your GitHub username?', function () {
        cbSeries();
      });
    },
    function (cbSeries) {
      program.prompt('Where do you want to clone projects to by default?',
        function () {
        cbSeries();
      });
    }
  ], function (err) {
    cb(err);
  });
};

var DirectoryEmitter = exports.DirectoryEmitter = function (projects) {
  EventEmitter.call(this);

  var self = this;

  async.eachSeries(projects, function (project, cbEach) {
    var expandedDirectory = expand(project.directory);

    fs.stat(expandedDirectory, function (err, stats) {
      if (err && err.code === 'ENOENT') {
        self.emit('missing', expandedDirectory, project);

        return cbEach();
      } else if (err) {
        return cbEach(err);
      }

      if (!stats.isDirectory()) {
        self.emit('file', expandedDirectory, project);

        return cbEach();
      }

      self.emit('directory', expandedDirectory, project);

      cbEach();
    });
  }, function (err) {
    if (err) {
      self.emit('error', err);
    }

    self.emit('end');
  });
};

util.inherits(DirectoryEmitter, EventEmitter);
