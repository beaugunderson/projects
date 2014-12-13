#!/usr/bin/env node

'use strict';

// description: run a command in each project directory
// arguments: <command>

var chalk = require('chalk');
var spawn = require('child_process').spawn;
var split = require('split');
var _ = require('lodash');

_.str = require('underscore.string');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('each', '<command>');

program.option('-s, --stdout', 'run commands in our stdout');

program.option('-n, --no-headers',
  'suppress the headers shown for each project');

program.option('-w, --warnings', 'warn on missing directories or directories ' +
  'that are actually files');

program.option('-i, --ignore-empty-output',
  "don't display projects with no output");

program.parse(process.argv);
program.handleColor();

var command = program.args[0];

var spawnOptions = {};

if (program.stdout) {
  spawnOptions.stdio = 'inherit';
}

function trimArray(array) {
  var start = _.findIndex(array);
  var end = _.findLastIndex(array);

  if (start === -1) {
    return [];
  }

  return array.slice(start, end + 1);
}

storage.setup(function () {
  var projects = storage.allWithDirectory();

  var longestName = _.max(projects,
    function (project) { return project.name.length; }).name.length + 2;

  var directories = new utilities.DirectoryEmitter(projects);

  directories.on('directory', function (directory, project) {
    // TODO: Make less OS X/Ubuntu/bash-centric
    var bash = spawn('bash', ['-c', command],
      _.extend(spawnOptions, {
        cwd: directory,
        env: _.extend(process.env, {
          PROJECT: project.name
        })
      }));

    if (program.stdout) {
      bash.on('close', process.exit);
    } else {
      var lines = [];

      bash.stdout.pipe(split()).on('data', function (line) {
        lines.push(line);
      });

      // We display things one of three ways--if there was only one line of
      // output we print it on the same line as the project name; if there was
      // more than one line we print it underneath, and if there were no lines
      // of output we print the project name in yellow.
      bash.on('close', function () {
        lines = trimArray(lines);

        if (lines.length > 1) {
          if (program.headers) {
            console.log(chalk.green(project.name));
          }
        } else if (lines.length === 1 && program.headers) {
          process.stdout.write(chalk.green(_.str.rpad(project.name + ':',
            longestName)));
        } else if (!program.ignoreEmptyOutput && program.headers) {
          console.log(chalk.yellow(_.str.rpad(project.name, longestName)));
        }

        if (lines.length) {
          console.log(lines.join('\n'));
        }

        if (lines.length > 1) {
          console.log();
        }
      });
    }
  });

  if (program.warnings) {
    directories.on('missing', function (directory) {
      console.warn(chalk.yellow(directory, 'is missing.'));
    });

    directories.on('file', function (directory) {
      console.warn(chalk.yellow(directory, 'is a file, not a directory.'));
    });
  }

  directories.on('error', function (err) {
    console.error('Error:', err);

    process.exit(1);
  });
});
