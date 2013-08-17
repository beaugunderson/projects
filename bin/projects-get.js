#!/usr/bin/env node

exports.command = {
  description: 'get an attribute for a project',
  arguments: '<project> <attribute>'
};

if (require.main !== module) {
  return;
}

var program = require('commander');
var util = require('util');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

program.option('--porcelain', 'Get the value in a machine-readable way');

program._name = 'get';
program.usage('<project> <attribute> <value>');
program.parse(process.argv);

storage.setup(function () {
  if (program.args.length !== 2) {
    console.error('Please specify a project and attribute.');

    process.exit(1);
  }

  // TODO: Support '.' for the project in the current directory
  var name = program.args[0];
  var attribute = program.args[1];

  var project = storage.getProjectOrDie(name);

  // XXX: Store the expanded directory instead? This feels hacky...
  if (attribute === 'directory') {
    project.directory = utilities.expand(project.directory);
  }

  if (program.porcelain) {
    console.log(project[attribute]);
  } else {
    console.log(util.format('%s:%s: "%s"', project.name, attribute,
      project[attribute]));
  }
});
