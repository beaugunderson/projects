#!/usr/bin/env node

exports.command = {
  description: 'show the JSON for a given project'
};

if (require.main !== module) {
  return;
}

var program = require('commander');

var storage = require('../lib/storage.js');

program._name = 'info';
program.usage('<project>');
program.parse(process.argv);

storage.setup(function () {
  if (!program.args.length) {
    console.error('Please specify a project.');

    process.exit(1);
  }

  var project = storage.getProject(program.args[0]);

  if (!project) {
    console.error('Project "' + program.args[0] + '" does not exist.');

    process.exit(1);
  }

  console.log(JSON.stringify(project, null, 2));
});
