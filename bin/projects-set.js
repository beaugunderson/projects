#!/usr/bin/env node

'use strict';

// description: set an attribute to a given value for a project
// arguments: <project> <attribute> <value>

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('set',
  '<project> <attribute> <value>');

storage.setup(function () {
  if (program.args.length !== 3) {
    console.error('Please specify a project, attribute, and value.');

    process.exit(1);
  }

  var name = program.args[0];
  var attribute = program.args[1];
  var value = program.args[2];

  var updates = {};

  updates[attribute] = value;

  storage.updateProjectOrDie(name, updates, function (project) {
    console.log('Set %s:%s to "%s"', project.name, attribute, value);
  });
});
