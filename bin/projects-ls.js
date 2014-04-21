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
var program = require('commander');
var storage = require('../lib/storage.js');

program._name = 'ls';

function list(project, cb) {
  if (typeof project.directory === 'undefined') {
    console.log(chalk.yellow(project.name));
  } else {
    console.log(chalk.green(project.name), chalk.blue.bold(String.fromCharCode(0x2192)), '', chalk.magenta(project.directory));
  }
  cb();
}

function cd(projects, cb) {
  async.each(projects, list, function(err){
    if (!err) return cb();
  });
}

storage.setup(function () {
    cd(storage.all(), process.exit);
});
