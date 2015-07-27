#!/usr/bin/env node

'use strict';

// description: list all projects

var fs = require('fs');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');
var _ = require('lodash');

var program = utilities.programDefaults('ls');
var theme = program.theme;

program.option('-1, --onlyName', 'only display the project name');

program.parse(process.argv);
program.handleColor();

function list(project, maxLength) {
  if (program.onlyName) {
    console.log(project.name);

    return;
  }

  project.name = _.padRight(project.name, maxLength);

  if (!project.directory) {
    console.log(theme.neutral(project.name));
  } else if (fs.existsSync(utilities.expand(project.directory))) {
    console.log(theme.good(project.name),
      utilities.colorizePath(project.directory));
  } else {
    console.log(theme.neutral(project.name));
  }
}

storage.setup(function () {
  var projects = storage.all();
  var maxLength = utilities.longestNameLength(projects);

  projects.forEach(function (project) {
    list(project, maxLength);
  });
});
