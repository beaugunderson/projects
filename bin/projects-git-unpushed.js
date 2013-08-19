#!/usr/bin/env node

exports.command = {
  description: 'display repositories with unpushed commits'
};

if (require.main !== module) {
  return;
}

var spawn = require('child_process').spawn;
var split = require('split');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('git-unpushed');

storage.setup(function () {
  var projects = storage.query({ directory: { $has: true } },
    { sortBy: function (project) { return project.name.toLowerCase(); } });

  var directories = new utilities.DirectoryEmitter(projects);

  directories.on('directory', function (directory, project) {
    var git = spawn('git', ['rev-list', 'origin..HEAD'], { cwd: directory });

    var commits = -1;

    git.stdout.setEncoding('utf-8');

    git.stdout
      .pipe(split())
      .on('data', function () {
        commits++;
      });

    git.on('close', function (code) {
      if (code) {
        return;
      }

      if (commits) {
        console.log('%s: %d commits ahead of origin', project.name, commits);
      }
    });
  });
});
