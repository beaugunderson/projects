#!/usr/bin/env node

'use strict';

// description: run a command in each project directory
// arguments: <command>

var chalk = require('chalk');
var spawn = require('child_process').spawn;
var split = require('split');
var _ = require('lodash');

_.mixin(require('lodash-deep'));

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
  var padding = _.max(_.deepPluck(projects, 'name.length')) + 2;

  var directories = new utilities.DirectoryEmitter(projects);

  directories.on('directory', function (directory, project) {
    // TODO: These return in the order finished, it might be worth it to add a
    // queue so that results only print after the items before them
    // (alphabetically) but still run in parallel
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

      // Display things one of three ways:
      //
      // - if there was one line of output print everything on one line
      // - if there was more than one line print it underneath the name
      // - if there were no lines of output print the project name in yellow
      bash.on('close', function () {
        lines = trimArray(lines);

        if (lines.length > 1) {
          if (program.headers) {
            console.log(chalk.green(project.name));
          }
        } else if (lines.length === 1 && program.headers) {
          process.stdout.write(chalk.green(_.padRight(project.name + ':',
            padding)));
        } else if (!program.ignoreEmptyOutput && program.headers) {
          console.log(chalk.yellow(_.padRight(project.name, padding)));
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
