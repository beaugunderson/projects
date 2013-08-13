#!/usr/bin/env node

exports.command = {
  description: '`git clone` a project',
  arguments: '<project>'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var spawn = require('child_process').spawn;

var config = require('../lib/config.js');
var paths = require('../lib/paths.js');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

program.option('-a, --all', 'clone all projects with a repository');
program.option('-d, --directory', 'the directory to clone into');

program._name = 'clone';
program.usage('<project>');
program.parse(process.argv);

function clone(project, cb) {
  var directory;

  directory = project.directory ||
    path.join(program.directory || config.projects.directory, project.name);

  if (!directory) {
    console.error('Please specify a projects directory in',
      paths.CONFIG_FILE, 'or via the -d, --directory flag.');

    process.exit(1);
  }

  fs.exists(utilities.expand(directory), function (exists) {
    if (exists) {
      console.warn(chalk.yellow('The path "%s" already exists, skipping.'),
        directory);

      return cb();
    }

    // Store the directory we resolved for the project in its entry for use by
    // other scripts
    storage.updateProject(project.name, { directory: directory }, function () {
      directory = utilities.expand(directory);

      spawn('git',
        ['clone', project.repository,  directory],
        { stdio: 'inherit' }).on('close', cb);
    });
  });
}

storage.setup(function () {
  if (program.all) {
    if (program.directory) {
      console.error('Error: --all and --directory are mutually exclusive.');

      process.exit(1);
    }

    var projects = storage.query({ repository: { $has: true } },
      { sortBy: function (project) { return project.name.toLowerCase(); } });

    async.eachSeries(projects, function (project, cbEach) {
      clone(project, cbEach);
    }, function (err) {
      if (err) {
        console.error('Error cloning projects:', err);
      }
    });
  } else {
    var name = program.args[0];

    if (!name) {
      console.error('Please specify a project.');

      process.exit(1);
    }

    var project = storage.getProjectOrDie(name);

    clone(project, process.exit);
  }
});
