#!/usr/bin/env node

exports.command = {
  description: 'query your projects',
  arguments: '[term]'
};

if (require.main !== module) {
  return;
}

var chalk = require('chalk');
var program = require('commander');
var _ = require('lodash');

var storage = require('../lib/storage.js');

var projectName = chalk.bold;

function formatStatus(project) {
  return project.status === 'active' ? chalk.green(project.status) :
    chalk.red(project.status);
}

function formatRole(project) {
  return project.role === 'creator' ? chalk.green(project.role) :
    chalk.gray(project.role);
}

function query(term) {
  var projects = storage.query({ name: { $likeI: term } });

  // XXX: Sort in query?
  projects = _.sortBy(projects, function (project) {
    return project.name.toLowerCase();
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
}

program._name = 'query';
program.usage('<term>');
program.parse(process.argv);

storage.setup(function () {
  query(program.args.join(' '));
});
