var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var program = require('commander');

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

exports.expand = function (string) {
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

exports.colorizePath = function (string) {
  string = contract(string);

  if (config.projects.directory) {
    var directory = contract(config.projects.directory);

    string = string.replace(new RegExp('^' + directory), chalk.gray(directory));
  }

  var filename = path.basename(string);

  return string.replace(new RegExp(filename + '$'), chalk.green(filename));
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
