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
  if ((/\/\.git\//).test(file) ||
      (/node_modules/).test(file)) {
    return setImmediate(cb);
  }

  fs.stat(file, function (err, stats) {
    // Sometimes there are broken symlinks
    if (err && err.code === 'ENOENT') {
      return cb();
    } else if (err && err.code === 'EACCES') {
      return cb();
    } else if (err) {
      return cb(err);
    }

    if (stats.isFile()) {
      files[file] = stats.mtime;
    }

    cb();
  });
}, 50);

var globOptions = {
  dot: true,
  silent: true,
  nosort: true
};

storage.setup(function () {
  var projects = storage.allWithDirectory();

  statQueue.pause();

  async.each(projects, function (project, cbEach) {
    var directory = path.join(utilities.expand(project.directory), '**');

    glob(directory, globOptions, function (err, results) {
      statQueue.push(_.compact(results));

      cbEach(err);
    }).on('error', function (err, meow) {
      if (err && err.code === 'EACCES') {
        console.log('Warning: Permission denied globbing', directory, meow);
      } else {
        console.log(err);
      }
    });
  }, function (err) {
    if (err) {
      console.error('Aborting, error:', err);

      process.exit(1);
    }

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

    statQueue.resume();
  });
});
