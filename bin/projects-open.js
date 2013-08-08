#!/usr/bin/env node

exports.command = {
  description: 'open a project\'s homepage'
};

var program = require('commander');
var spawn = require('child_process').spawn;
var _ = require('lodash');

var projectsFile = require('../lib/projectsFile.js');

if (require.main === module) {
  program.parse(process.argv);

  projectsFile.get(function (projects) {
    var project = _.find(projects.projects, { name: program.args[0] });

    if (!project) {
      console.error('Project "' + program.args[0] + '" does not exist.');

      process.exit(1);
    }

    spawn('open', [project.homepage], { stdio: 'inherit' });
  });
}
