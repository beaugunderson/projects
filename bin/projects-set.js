#!/usr/bin/env node

exports.command = {
  description: 'set an attribute to a given value for a project',
  arguments: '<project> <attribute> <value>'
};

if (require.main !== module) {
  return;
}

var program = require('commander');
var util = require('util');

var storage = require('../lib/storage.js');

program._name = 'set';
program.usage('<project> <attribute> <value>');
program.parse(process.argv);

storage.setup(function () {
  if (program.args.length !== 3) {
    console.error('Please specify a project, attribute, and value.');

    process.exit(1);
  }

  var name = program.args[0];
  var attribute = program.args[1];
  var value = program.args[2];

  // XXX: Is there an update semantic that would work well here?
  var project = storage.getProjectOrDie(name);

  project[attribute] = value;

  storage.db.set(project.name, project, function () {
    console.log(util.format('Set %s:%s to "%s"', project.name, attribute,
      value));
  });
});
