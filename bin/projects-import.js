#!/usr/bin/env node

'use strict';

// description: add the specified project directories
// arguments: <path>

var async = require('async');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var RE_GITHUB_HOMEPAGE = /[\/:]([^\/]*?\/[^\/]*?)\.git$/;

var program = utilities.programDefaultsParse('import', '<path>');

if (!program.args) {
  console.error('Please specify at least one path');

  process.exit(1);
}

function addProject(directory, callback) {
  console.log('Importing %s', utilities.expand(directory));

  // TODO: Get active status based on last commit
  exec('git ls-remote --get-url', {cwd: directory}, function (err, stdout) {
    var repository;

    if (!err && stdout) {
      repository = stdout.trim();
    }

    var project = {
      name: path.basename(directory),
      directory: directory
    };

    if (repository) {
      project.repository = repository;

      if (/github/.test(repository)) {
        var matches = RE_GITHUB_HOMEPAGE.exec(repository);

        if (matches) {
          project.homepage = 'https://github.com/' + matches[1];
        }
      }
    }

    // XXX: Should we attempt to upsert based on the path here first?
    storage.upsertProject(project.name, project, callback);
  });
}

storage.setup(function () {
  async.eachSeries(program.args, function (directory, cbEachSeries) {
    fs.stat(directory, function (err, stats) {
      // Sometimes there are broken symlinks
      if (err && err.code === 'ENOENT') {
        return console.log('Ignore broken symlink:', directory);
      } else if (err) {
        throw err;
      }

      if (!stats.isDirectory()) {
        console.log('Ignoring non-directory "%s"', directory);

        return cbEachSeries();
      }

      return addProject(utilities.expand(directory), cbEachSeries);
    });
  }, function (err) {
    if (err) {
      return console.error('Error adding paths:', err);
    }

    console.log('Done.');
  });
});
