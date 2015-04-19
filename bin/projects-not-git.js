#!/usr/bin/env node

'use strict';

// description: list projects not in git

var async = require('async');
var fs = require('fs');
var gift = require('gift');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('git-status');

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var repo = gift(utilities.expand(project.directory));

    repo.status(function (err) {
      if (!fs.existsSync(utilities.expand(project.directory))) {
        return cbEach();
      }

      if (err) {
        if (err.code === 128) {
          console.log(project.name, utilities.colorizePath(project.directory));
        }
      }

      cbEach();
    });
  });
});
