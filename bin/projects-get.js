#!/usr/bin/env node

exports.command = {
  description: 'get an attribute for a project'
};

if (require.main !== module) {
  return;
}

var program = require('commander');
var util = require('util');

var storage = require('../lib/storage.js');

program.option('--porcelain', 'Get the value in a machine-readable way');

program._name = 'get';
program.usage('<project> <attribute> <value>');
program.parse(process.argv);

storage.setup(function () {
  if (program.args.length !== 2) {
    console.error('Please specify a project and attribute.');

    process.exit(1);
  }

  var name = program.args[0];
  var attribute = program.args[1];

  // XXX: Is there an update semantic that would work well here?
  var project = storage.getProjectOrDie(name);

  if (program.porcelain) {
    console.log(project[attribute]);
  } else {
    console.log(util.format('%s:%s: "%s"', project.name, attribute,
      project[attribute]));
  }
});
