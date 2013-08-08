#!/usr/bin/env node

exports.command = {
  description: 'query your projects'
};

var path = require('path');
var program = require('commander');
var spawn = require('child_process').spawn;
var _ = require('lodash');

var projectsFile = require('../lib/projectsFile.js');

if (require.main === module) {
  program.option('-d, --directory', 'the directory to clone into');

  program.parse(process.argv);

  projectsFile.get(function (projects) {
    var directory = program.directory || projects.meta.projectDirectory;

    if (!directory) {
      console.error('Specify { meta: projectDirectory: "" } in your ' +
        '.projects.json or use the -d, --directory flag.');

      process.exit(1);
    }

    var project = _.find(projects.projects, { name: program.args[0] });

    if (!project) {
      console.error('Project "' + program.args[0] + '" does not exist.');

      process.exit(1);
    }

    spawn('git', ['clone', project.repository,
      path.join(directory, project.name)], { stdio: 'inherit' });
  });
}
