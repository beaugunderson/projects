#!/usr/bin/env node

'use strict';

// description: query your projects
// arguments: [term] | [attribute:value]

var chalk = require('chalk');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('query', '[term] | [attribute:value]');

program.option('-p, --porcelain', 'Get the value in a machine-readable way');

program.option('-a, --alfred',
  'output XML in Alfred\'s format for autocompletion');

program.parse(process.argv);
program.handleColor();

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

function outputProjectsAlfred(projects) {
  var et = require('elementtree');

  var root = new et.Element('items');

  projects.forEach(function (project) {
    var item = new et.SubElement(root, 'item');

    item.set('uid', project.name);
    item.set('arg', project.name);
    item.set('valid', 'YES');
    item.set('autocomplete', project.name);

    var title = new et.SubElement(item, 'title');
    title.text = project.name;

    if (project.description) {
      var subtitle = new et.SubElement(item, 'subtitle');
      subtitle.text = project.description;
    }
  });

  console.log(new et.ElementTree(root).write());
}

function outputProjectsPlain(projects) {
  projects.forEach(function (project) {
    var output;

    if (program.porcelain) {
      output = project.name;

      if (project.directory) {
        output += ': ' + project.directory;
      }
    } else {
      output = _.filter([
        projectName(project.name),
        formatStatus(project),
        formatRole(project),
        project.language
      ]).join(', ');
    }

    console.log(output);
  });
}

function query(term) {
  var projects;

  // Search by attribute
  if (term.indexOf(':') !== -1) {
    term = term.split(':');

    var attribute = term[0];
    var value = term[1];

    var predicate = {};

    predicate[attribute] = {$equal: value};

    projects = storage.query(predicate,
      {sortBy: storage.sortByName});
  // Search by name
  } else {
    projects = storage.query({name: {$likeI: term}},
      {sortBy: storage.sortByName});
  }

  if (program.alfred) {
    return outputProjectsAlfred(projects);
  }

  outputProjectsPlain(projects);
}

storage.setup(function () {
  query(program.args.join(' '));
});
