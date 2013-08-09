#!/usr/bin/env node

exports.command = {
  description: 'open a project\'s homepage'
};

if (require.main !== module) {
  return;
}

var program = require('commander');
var spawn = require('child_process').spawn;
var _ = require('lodash');

var storage = require('../lib/storage.js');

program._name = 'open';
program.usage('<project>');
program.parse(process.argv);

storage.setup(function () {
  var results = storage.query({ name: program.args[0] });

  if (!results.length) {
    console.error('Project "' + program.args[0] + '" does not exist.');

    process.exit(1);
  }

  var project = _.first(results);

  spawn('open', [project.homepage], { stdio: 'inherit' });
});
