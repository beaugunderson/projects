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

if (!program.args.length) {
  console.error('Please specify a project.');

  process.exit(1);
}

storage.setup(function () {
  var project = storage.getProjectOrDie(program.args[0]);

  spawn('git',
    ['clone', project.repository,  path.join(directory, project.name)],
    { stdio: 'inherit' }).on('close', process.exit);
});
