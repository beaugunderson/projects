#!/usr/bin/env node

'use strict';

// description: import your projects from plain JSON

var async = require('async');
var stdin = require('get-stdin');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('json-in');

storage.setup(function () {
  stdin(function (data) {
    var projects;

    // TODO: create tryParse utility function
    try {
      projects = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse:', e);

      process.exit(1);
    }

    // TODO: Overwite vs. update
    async.forEachSeries(projects, function (project, cbForEach) {
      console.log('Adding', project.name);

      storage.db.set(project.name, project, cbForEach);
    }, function (err) {
      if (err) {
        console.error('Error saving projects:', err);

        process.exit(1);
      }

      console.log('Finished');
    });
  });
});
