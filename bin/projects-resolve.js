#!/usr/bin/env node

'use strict';

// description: resolve a path to a project
// arguments: <path>

var path = require('path');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('resolve', '<path>');

program.option('-r, --relative', 'display the relative path');

program.parse(process.argv);
program.handleColor();

if (!program.args[0]) {
  console.error('Please specify a path.');

  process.exit(1);
}

storage.setup(function () {
  var project = storage.getProjectByDirectory(program.args[0]);

  if (!project) {
    process.exit(1);
  }

  if (program.relative) {
    var relativePath = path.relative(process.cwd(), project.directory);

    // Return '.' if we're at the root of the project
    console.log(relativePath === '' ? '.' : relativePath);
  } else {
    console.log(project.directory);
  }
});
