#!/usr/bin/env node

'use strict';

// description: show the JSON for a given project
// arguments: <project>

var cardinal = require('cardinal');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('info', '<project>');

storage.setup(function () {
  if (!program.args.length) {
    console.error('Please specify a project.');

    process.exit(1);
  }

  var project = storage.getProjectOrDie(program.args[0]);

  var output = JSON.stringify(project, null, 2);

  if (program.supportsColor) {
    console.log(cardinal.highlight(output, {json: true}));
  } else {
    console.log(output);
  }
});
