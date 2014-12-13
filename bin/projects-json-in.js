#!/usr/bin/env node

'use strict';

// description: import your projects from plain JSON

var async = require('async');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('json-in');

storage.setup(function () {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  var json = '';

  process.stdin.on('data', function (chunk) {
    json += chunk;
  });

  process.stdin.on('end', function () {
    var projects;

    try {
      projects = JSON.parse(json);
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
