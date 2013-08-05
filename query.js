var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

var projectsFile = path.join(home, '.projects.json');

var projectName = chalk.bold;

function formatStatus(project) {
  return project.status === 'active' ? chalk.green(project.status) :
    chalk.red(project.status);
}

function formatRole(project) {
  return project.role === 'creator' ? chalk.green(project.role) :
    chalk.gray(project.role);
}

exports.query = function (term) {
  term = new RegExp(term, 'i');

  fs.exists(projectsFile, function (exists) {
    if (!exists) {
      console.error('You need a ~/projects.json file.');

      process.exit(1);
    }

    var projects;

    try {
      projects = require(projectsFile);
    } catch (e) {
      console.error('Error opening', projectsFile, ':', e);

      process.exit(1);
    }

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
