#!/usr/bin/env node

'use strict';

// description: `git clone` a project
// arguments: <project>

var async = require('async');
var chalk = require('chalk');
var config = require('../lib/config.js');
var fs = require('fs');
var path = require('path');
var paths = require('../lib/paths.js');
var spawn = require('child_process').spawn;
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');
var _ = require('lodash');

var program = utilities.programDefaults('clone', '<project>');

program.option('-a, --all', 'clone all projects with a repository');
program.option('-d, --directory', 'the directory to clone into');

program.parse(process.argv);
program.handleColor();

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
    storage.updateProject(project.name, {directory: directory}, function () {
      directory = utilities.expand(directory);

      spawn('git',
        ['clone', project.repository, directory],
        {stdio: 'inherit'}).on('close', cb);
    });
  });
}

function cloneSeries(projects, cb) {
  async.eachSeries(projects, function (project, cbEach) {
    clone(project, cbEach);
  }, function (err) {
    if (err) {
      console.error('Error cloning projects:', err);
    }

    if (cb) {
      cb(err);
    }
  });
}

function collectProjects(names) {
  _(names).map(function (name) {
    if (name.indexOf('*') !== -1) {
      return storage.minimatch(name);
    }

    return storage.getProjectOrDie(name);
  })
  .flatten()
  .uniq(_.pluck('name'))
  .valueOf();
}

storage.setup(function () {
  if (program.all) {
    if (program.directory) {
      console.error('Error: --all and --directory are mutually exclusive.');

      process.exit(1);
    }

    var projects = storage.query({repository: {$has: true}},
      {sortBy: storage.sortByName});

    cloneSeries(projects, process.exit);
  } else {
    if (!program.args.length) {
      console.error('Please specify a project.');

      process.exit(1);
    }

    cloneSeries(collectProjects(program.args), process.exit);
  }
});
