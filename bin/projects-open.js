#!/usr/bin/env node

exports.command = {
  description: 'open a project\'s homepage'
};

if (require.main !== module) {
  return;
}

var program = require('commander');
var spawn = require('child_process').spawn;

var storage = require('../lib/storage.js');

program._name = 'open';
program.usage('<project>');
program.parse(process.argv);

storage.setup(function () {
  var project = storage.getProjectOrDie(program.args[0]);

  spawn('open', [project.homepage], { stdio: 'inherit' })
    .on('close', process.exit);
});
