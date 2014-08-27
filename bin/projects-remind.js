#!/usr/bin/env node

exports.command = {
  description: 'a reminder of what you were working on last',
  arguments: '[-n/--number <number>] [timespan]'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var glob = require('glob');
var moment = require('moment');
var path = require('path');
var program = require('commander');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('remind',
  '[-n/--number <number>] [timespan]');

program.option('-n, --number <number>', 'the number of files to show',
  _.partialRight(parseInt, 10));

program.parse(process.argv);
program.handleColor();

var timespan = program.args[0];

if (!program.number) {
  program.number = 10;
}

var files = {};

var statQueue = async.queue(function (file, cb) {
  fs.stat(file, function (err, stats) {
    // Sometimes there are broken symlinks
    if (err && err.code === 'ENOENT') {
      return cb();
    } else if (err) {
      return cb(err);
    }

    if (stats.isFile() &&
      !(/\/\.git\//).test(file) &&
      !(/node_modules/).test(file)) {
      files[file] = stats.mtime;
    }

    cb();
  });
}, 10);

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    glob(path.join(utilities.expand(project.directory), '**'),
      { dot: true }, function (err, results) {

      statQueue.push(results);

      cbEach(err);
    });
  }, function () {
    statQueue.drain = function () {
      var sortedFiles = _.sortBy(_.keys(files), function (file) {
        return -files[file].valueOf();
      });

      console.log('Recently changed files:');
      console.log();

      _.first(sortedFiles, program.number).forEach(function (file) {
        console.log(utilities.colorizePath(file),
          chalk.gray(moment(files[file]).fromNow(true)));
      });
    };
  });
});
