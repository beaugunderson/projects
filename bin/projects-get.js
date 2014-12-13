#!/usr/bin/env node

'use strict';

// description: get an attribute for a project
// arguments: <project> <attribute>

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('get', '<project> <attribute>');

program.option('-p, --porcelain', 'Get the value in a machine-readable way');

program.parse(process.argv);

storage.setup(function () {
  if (program.args.length !== 2) {
    console.error('Please specify a project and attribute.');

    process.exit(1);
  }

  var name = program.args[0];
  var attribute = program.args[1];

  var project = storage.getProjectOrDie(name);

  if (attribute === 'directory') {
    project.directory = utilities.expand(project.directory);
  }

  if (program.porcelain) {
    console.log(project[attribute] || '');
  } else {
    console.log('%s:%s: "%s"', project.name, attribute,
                project[attribute] || '');
  }
});
