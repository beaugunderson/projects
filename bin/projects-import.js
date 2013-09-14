#!/usr/bin/env node

exports.command = {
  description: 'fill your projects.db from a directory'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var fs = require('fs');
var Glob = require('glob').Glob;
var moment = require('moment');
var path = require('path');
var exec = require('child_process').exec;
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var RE_GITHUB_HOMEPAGE = /[\/:]([^\/]*?\/[^\/]*?)\.git$/;

var program = utilities.programDefaultsParse('import');

var directory = program.args[0];

if (!directory) {
  console.error('Please specify a directory/glob pattern.');

  process.exit(1);
}

var q = async.queue(function (directory, callback) {
  console.log('Importing %s', utilities.expand(directory));

  // TODO: Get active status based on last commit
  exec('git ls-remote --get-url', { cwd: directory },
    function (err, stdout) {
      var repository;

      if (!err && stdout) {
        repository = stdout.trim();
      }

      var project = {
        name: path.basename(directory),
        directory: directory
      };

      if (repository) {
        _.extend(project, { repository: repository });

        if (/github/.test(repository)) {
          var matches = RE_GITHUB_HOMEPAGE.exec(repository);

          if (matches) {
            var url = 'https://github.com/' + matches[1];

            _.extend(project, { homepage: url });
          }
        }
      }

      // XXX: Should we attempt to upsert based on the path here first?
      storage.upsertProject(project.name, project, callback);
    });
}, 1);

q.drain = function () {
  console.log('Done.');
};

storage.setup(function () {
  console.log('Filling projects from ' + directory);

  var glob = new Glob(directory, {});

  glob.on('match', function (match) {
    fs.stat(match, function (err, stats) {
      // Sometimes there are broken symlinks
      if (err && err.code === 'ENOENT') {
        return console.log(match);
      } else if (err) {
        throw err;
      }

      if (stats.isDirectory()) {
        q.push(utilities.expand(match));
      }
    });
  });
});
