#!/usr/bin/env node

exports.command = {
  description: '`git clone` a project',
  arguments: '<project>'
};

if (require.main !== module) {
  return;
}

var path = require('path');
var program = require('commander');
var spawn = require('child_process').spawn;

var config = require('../lib/config.js');
var paths = require('../lib/paths.js');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

program.option('-d, --directory', 'the directory to clone into');

program._name = 'clone';
program.usage('<project>');
program.parse(process.argv);

var projectName = program.args[0];

if (!projectName) {
  console.error('Please specify a project.');

  process.exit(1);
}

storage.setup(function () {
  var project = storage.getProjectOrDie(projectName);

  var directory;

  directory = project.directory ||
    path.join(program.directory || config.projects.directory, project.name);

  if (!directory) {
    console.error('Please specify a projects directory in',
      paths.CONFIG_FILE, 'or via the -d, --directory flag.');

    process.exit(1);
  }

  // Store the directory we resolved for the project in its entry for use by
  // other scripts
  storage.updateProject(projectName, { directory: directory }, function () {
    directory = utilities.expand(directory);

    spawn('git',
      ['clone', project.repository,  directory],
      { stdio: 'inherit' }).on('close', process.exit);
  });
});
