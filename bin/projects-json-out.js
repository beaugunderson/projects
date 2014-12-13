#!/usr/bin/env node

'use strict';

// description: export your projects to plain JSON

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('json-out');

storage.setup(function () {
  var projects = storage.all();

  console.log(JSON.stringify(projects, null, 2));
});
