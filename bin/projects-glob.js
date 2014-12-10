#!/usr/bin/env node

exports.command = {
  description: 'glob the files in all projects',
  arguments: '<pattern>'
};

if (require.main !== module) {
  return;
}

require('log-buffer');

var async = require('async');
var fs = require('fs');
var Glob = require('glob').Glob;
var path = require('path');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('glob', '<command>');

program.option('--dot', 'match files beginning with a .');
program.option('-d, --directories', 'only match directories');
program.option('-e, --expand', 'expand path names');
program.option('-f, --files', 'only match files');
program.option('-n, --no-filter', 'don\'t filter .git, node_modules');

program.parse(process.argv);

if (program.files && program.directories) {
  console.error('You can only specify either --files or --directories');

  process.exit(1);
}

var globOptions = {
  dot: program.dot,
  nosort: true
};

if (program.files || program.directories) {
  globOptions.stat = true;
}

var pattern = program.args.join(' ');

var filterMatch = function (match) {
  return match.indexOf('/node_modules/') > -1 ||
         match.indexOf('/.git/') > -1;
};

if (program.noFilter) {
  filterMatch = function () {
    return false;
  };
}

var statTest = 'isFile';

if (program.directories) {
  statTest = 'isDirectory';
}

function printMatch(match) {
  if (program.expand) {
    return console.log(utilities.expand(match));
  }

  console.log(utilities.contract(match));
}

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var globPattern = path.join(utilities.expand(project.directory), pattern);
    var glob = new Glob(globPattern, globOptions);

    if (!program.files && !program.directories) {
      glob.on('match', function (match) {
        if (filterMatch(match)) {
          return;
        }

        printMatch(match);
      });
    }

    if (program.files || program.directories) {
      glob.on('stat', function (match, stat) {
        if (filterMatch(match)) {
          return;
        }

        if (stat[statTest]()) {
          printMatch(match);
        }
      });
    }

    glob.on('error', function (err) {
      console.log('Error globbing projects:', err);

      process.exit(1);
    });

    glob.on('end', _.partial(cbEach, null));
  });
});
