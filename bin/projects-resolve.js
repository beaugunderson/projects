#!/usr/bin/env node

exports.command = {
  description: 'resolve a path to a project',
  arguments: '<path>'
};

if (require.main !== module) {
  return;
}

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

  if (project) {
    if (program.relative) {
      console.log(path.relative(process.cwd(), project.directory));
    } else {
      console.log(project.directory);
    }

    process.exit(0);
  }

  process.exit(1);
});
