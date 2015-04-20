'use strict';

var async = require('async');
var chalk = require('chalk');
var commander = require('commander');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var supportsColor = require('supports-color');
var mkdirp = require('mkdirp');
var path = require('path');
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

exports.isPath = function (string) {
  return string &&
    (string[0] === '.' ||
     string[0] === '~' ||
     string.indexOf('/') !== -1);
};

var expand = exports.expand = function (string) {
  if (!string) {
    return null;
  }

  if (string[0] === '~') {
    string = path.join(paths.HOME, string.substr(1));
  }

  return path.resolve(string);
};

var contract = exports.contract = function (string) {
  // First expand, in case it's '.' for example
  string = expand(string);

  if (string.substr(0, paths.HOME.length) === paths.HOME) {
    string = path.join('~', string.substr(paths.HOME.length));
  }

  return path.normalize(string);
};

exports.colorizePath = function (string, optionalColorFn) {
  if (!optionalColorFn) {
    optionalColorFn = chalk.green;
  }

  var contracted = contract(string);
  var colorized = contracted;

  if (config.projects.directory) {
    var directory = contract(config.projects.directory);

    colorized = contracted.replace(new RegExp('^' + directory + '/'),
      chalk.gray(directory + '/'));
  }

  var filename = path.basename(contracted);

  return colorized.replace(new RegExp(filename + '$'),
    optionalColorFn(filename));
};

exports.firstTimeSetup = function (cb) {
  async.series([
    function (cbSeries) {
      commander.prompt('What\'s your GitHub username?', function () {
        cbSeries();
      });
    },
    function (cbSeries) {
      commander.prompt('Where do you want to clone projects to by default?',
        function () {
        cbSeries();
      });
    }
  ], function (err) {
    cb(err);
  });
};

var programDefaults = exports.programDefaults = function (name, optionalUsage) {
  // handle EPIPE here so all subcommands that use programDefaults get it too
  require('epipebomb')();

  var program = new commander.Command();

  program.option('-c, --color [when]', 'color the output [auto]', 'auto');

  program._name = name;
  program.usage(optionalUsage || '');

  program.handleColor = function () {
    // An environment variable for disabling coloring is one thing that
    // supports-color doesn't have
    if (process.env.DISABLE_COLOR) {
      program.color = 'never';
    }

    if (program.color === 'never') {
      program.supportsColor = false;

      chalk.enabled = false;
    } else {
      program.supportsColor = (program.color === 'auto' && supportsColor) ||
                               program.color === 'always';

    }
  };

  return program;
};

exports.programDefaultsParse = function (name, usage) {
  var program = programDefaults(name, usage);

  program.parse(process.argv);

  program.handleColor();

  return program;
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
