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

// TODO: Think about colors and display
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
  var projects;

  if (term.indexOf(':') !== -1) {
    term = term.split(':');

    var attribute = term[0];
    var value = term[1];

    var predicate = {};

    predicate[attribute] = { $equal: value };

    projects = storage.query(predicate,
      { sortBy: function (project) { return project.name.toLowerCase(); } });
  } else {
    projects = storage.query({ name: { $likeI: term } },
      { sortBy: function (project) { return project.name.toLowerCase(); } });
  }

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
