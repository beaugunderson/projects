#!/usr/bin/env node

exports.command = {
  description: 'export your projects to plain JSON'
};

if (require.main !== module) {
  return;
}

var program = require('commander');

var storage = require('../lib/storage.js');

storage.setup(function () {
  program._name = 'json-out';
  program.parse(process.argv);

  var projects = storage.all();

  console.log(JSON.stringify(projects, null, 2));
});
