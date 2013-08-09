#!/usr/bin/env node

exports.command = {
  description: '`git clone` a project'
};

if (require.main !== module) {
  return;
}

var path = require('path');
var program = require('commander');
var spawn = require('child_process').spawn;
var _ = require('lodash');

var config = require('../lib/config.js');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

program.option('-d, --directory', 'the directory to clone into');

program._name = 'clone';
program.usage('<project>');
program.parse(process.argv);

var directory = program.directory || config.projects.directory;

if (!directory) {
  console.error('Please specify a projects directory in',
    utilities.CONFIG_FILE, 'or via the -d, --directory flag.');

  process.exit(1);
}

directory = utilities.expand(directory);

storage.setup(function () {
  var results = storage.query({
    name: {
      $regex: new RegExp(program.args[0], 'i')
    }
  });

  if (!results.length) {
    console.error('Project "' + program.args[0] + '" does not exist.');

    process.exit(1);
  }

  var project = _.first(results);

  // TODO: Properly pass through the error code from git
  spawn('git', ['clone', project.repository,
    path.join(directory, project.name)], { stdio: 'inherit' });
});
