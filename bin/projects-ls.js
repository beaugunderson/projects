#!/usr/bin/env node

'use strict';

exports.command = {
  description: 'list all projects'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('ls');

program.option('-1, --onlyName', 'only display the project name');

program.parse(process.argv);
program.handleColor();

function list(project, cb) {
  if (program.onlyName) {
    console.log(project.name);

    return cb();
  }

  if (!project.directory) {
    console.log(chalk.yellow(project.name));
  } else {
    if (fs.existsSync(utilities.expand(project.directory))) {
      console.log(chalk.green(project.name),
        chalk.blue.bold(String.fromCharCode(0x2192)),
        chalk.magenta(project.directory));
    } else {
      console.log(chalk.yellow(project.name));
    }
  }

  cb();
}

storage.setup(function () {
  async.each(storage.all(), list, function () {
    process.exit();
  });
});
