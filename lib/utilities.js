var async = require('async');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var program = require('commander');

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
