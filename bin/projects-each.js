#!/usr/bin/env node

'use strict';

// description: run a command in each project directory
// arguments: <command>

var spawn = require('child_process').spawn;
var split = require('split');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('each', '<command>');

program.option('-s, --stdout', 'run commands in our stdout');

program.option('-n, --no-headers',
  'suppress the headers shown for each project');

program.option('-w, --warnings', 'warn on missing directories or directories ' +
  'that are actually files');

program.option('-d, --display-no-output', 'display projects with no output');

program.option('-a, --always-indent', 'always pad output to longest name');

program.parse(process.argv);
program.handleColor();

var theme = program.theme;

var command = program.args[0];

if (!command) {
  console.error('Please specify a command.');

  process.exit(1);
}

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
  var padding = utilities.longestNameLength(projects) + 1;

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
            if (program.alwaysIndent) {
              process.stdout.write(theme.good(_.padRight(project.name,
                padding)));
            } else {
              console.log(theme.good(project.name));
            }
          }
        } else if (lines.length === 1 && program.headers) {
          process.stdout.write(theme.good(_.padRight(project.name,
            padding)));
        } else if (program.displayEmptyOutput && program.headers) {
          console.log(theme.neutral(_.padRight(project.name, padding)));
        }

        if (program.alwaysIndent) {
          if (!lines.length) {
            return;
          }

          console.log(_.first(lines));

          if (lines.length > 1) {
            console.log(_.rest(lines).map(function (line) {
              return _.padRight(' ', padding) + line;
            }).join('\n'));
          }
        } else {
          if (lines.length) {
            console.log(lines.join('\n'));
          }

          if (lines.length > 1) {
            console.log();
          }
        }
      });
    }
  });

  if (program.warnings) {
    directories.on('missing', function (directory) {
      console.warn(theme.bad(directory, 'is missing.'));
    });

    directories.on('file', function (directory) {
      console.warn(theme.bad(directory, 'is a file, not a directory.'));
    });
  }

  directories.on('error', function (err) {
    console.error('Error:', err);

    process.exit(1);
  });
});
