#!/usr/bin/env node

'use strict';

// description: open a project's homepage
// arguments: <project>

var spawn = require('child_process').spawn;

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('open', '<project>');

if (!program.args[0]) {
  console.error('Please specify a project.');

  process.exit(1);
}

storage.setup(function () {
  var project = storage.getProjectOrDie(program.args[0]);

  spawn('open', [project.homepage], {stdio: 'inherit'})
    .on('close', process.exit);
});
