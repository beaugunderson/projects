#!/usr/bin/env node

exports.command = {
  description: 'query your projects'
};

var chalk = require('chalk');
var program = require('commander');
var _ = require('lodash');

var projectsFile = require('../lib/projectsFile.js');

var projectName = chalk.bold;

function formatStatus(project) {
  return project.status === 'active' ? chalk.green(project.status) :
    chalk.red(project.status);
}

function formatRole(project) {
  return project.role === 'creator' ? chalk.green(project.role) :
    chalk.gray(project.role);
}

var query = exports.query = function (term) {
  term = new RegExp(term, 'i');

  projectsFile.get(function (projects) {
    projects = projects.projects;

    projects = _.sortBy(projects, function (project) {
      return project.name.toLowerCase();
    });

    projects = _.filter(projects, function (project) {
      return term.test(project.name);
    });

    projects.forEach(function (project) {
      var output = _.filter([
        projectName(project.name),
        formatStatus(project),
        formatRole(project),
        project.language
      ]).join(', ');

      console.log(output);
    });
  });
};

if (require.main === module) {
  program.parse(process.argv);

  query(program.args.join(' '));
}
