#!/usr/bin/env node

'use strict';

// description: list all projects

var chalk = require('chalk');
var fs = require('fs');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('ls');

program.option('-1, --onlyName', 'only display the project name');

program.parse(process.argv);
program.handleColor();

function list(project) {
  if (program.onlyName) {
    console.log(project.name);

    return;
  }

  if (!project.directory) {
    console.log(chalk.yellow(project.name));
  } else if (fs.existsSync(utilities.expand(project.directory))) {
    console.log(chalk.green(project.name),
      chalk.reset.bold('→'),
      chalk.magenta(project.directory));
  } else {
    console.log(chalk.yellow(project.name));
  }
}

storage.setup(function () {
  storage.all().forEach(list);
});
