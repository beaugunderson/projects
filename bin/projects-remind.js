#!/usr/bin/env node

'use strict';

// description: a reminder of what you were working on last
// arguments: [-n/--number <number>] [timespan]

var async = require('async');
var chalk = require('chalk');
var debug = require('debug')('projects-remind');
var Glob = require('glob').Glob;
var ignore = require('ignore');
var moment = require('moment');
var path = require('path');
var ProgressBar = require('progress');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('remind',
  '[-n/--number <number>] [timespan]');

program.option('--dot', 'match files beginning with a .');
program.option('-n, --number <number>', 'the number of files to show',
  _.partialRight(parseInt, 10));

program.parse(process.argv);
program.handleColor();

// var timespan = program.args[0];

if (!program.number) {
  program.number = 15;
}

var files = {};

var globOptions = {
  dot: program.dot,
  silent: true,
  nosort: true,
  stat: true
};

var gitIgnore = ignore();

gitIgnore.addIgnoreFile(path.join(process.env.HOME, '.gitignore'));

var gitIgnoreFilter = gitIgnore.createFilter();

function filterMatch(match) {
  return match.indexOf('/node_modules/') > -1 ||
         match.indexOf('/.git/') > -1 ||
         !gitIgnoreFilter(match);
}

storage.setup(function () {
  var projects = storage.allWithDirectory();

  var bar = new ProgressBar('[:bar] :current/:total :percent :etas', {
    total: projects.length,
    clear: true
  });

  async.eachSeries(projects, function (project, cbEach) {
    debug('project %s', project.name);

    var globPattern = path.join(utilities.expand(project.directory), '**');
    var glob = new Glob(globPattern, globOptions);

    glob.on('stat', function (path, stat) {
      if (filterMatch(path) || stat.isDirectory()) {
        return;
      }

      files[path] = stat.mtime;
    });

    glob.on('end', function () {
      bar.tick();

      cbEach();
    });
  }, function () {
    var sortedFiles = _.sortBy(_.keys(files), function (file) {
      return -files[file].valueOf();
    });

    console.log('Recently changed files:');
    console.log();

    _.take(sortedFiles, program.number).forEach(function (file) {
      console.log(utilities.colorizePath(file),
        chalk.gray(moment(files[file]).fromNow(true)));
    });
  });
});
