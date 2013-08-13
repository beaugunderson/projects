#!/usr/bin/env node

exports.command = {
  description: 'run a command in each project directory',
  arguments: '<command>'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var chalk = require('chalk');
var program = require('commander');
var spawn = require('child_process').spawn;

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

program.option('-n, --no-headers',
  'suppress the headers shown for each project');

program._name = 'each';
program.usage('<command>');
program.parse(process.argv);

var command = program.args[0];

storage.setup(function () {
  var projects = storage.query({ directory: { $has: true } },
    { sortBy: function (project) { return project.name.toLowerCase(); } });

  async.eachSeries(projects, function (project, cbEach) {
    if (!program.noHeaders) {
      console.log(chalk.green(project.name));
    }

    // TODO: Make less OS X/Ubuntu/bash-centric
    spawn('bash', ['-c', command], {
      cwd: utilities.expand(project.directory),
      stdio: 'inherit'
    }).on('close', function (code) {
      if (!program.noHeaders) {
        console.log();
      }

      cbEach(code);
    });
  });
});
