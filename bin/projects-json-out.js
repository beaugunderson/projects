#!/usr/bin/env node

exports.command = {
  description: 'export your projects to plain JSON'
};

if (require.main !== module) {
  return;
}

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('json-out');

storage.setup(function () {
  var projects = storage.all();

  console.log(JSON.stringify(projects, null, 2));
});
