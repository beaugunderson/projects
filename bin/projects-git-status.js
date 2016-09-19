#!/usr/bin/env node

'use strict';

// description: git status across all repositories

var async = require('async');
var gift = require('gift');
var path = require('path');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('git-status');
var theme = program.theme;

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var repo = gift(utilities.expand(project.directory));

    repo.status(function (err, repoStatus) {
      if (repoStatus.clean) {
        return cbEach();
      }

      _.each(repoStatus.files, function (status, file) {
        var letter;
        var colorFn;

        if (!status.tracked) {
          letter = '??';
          colorFn = theme.red;
        } else if (status.type) {
          if (status.staged) {
            letter = _.padEnd(status.type, 2);
            colorFn = theme.yellow;
          } else {
            letter = _.padStart(status.type, 2);

            if (status.type === 'M') {
              colorFn = theme.green;
            } else if (status.type === 'D') {
              colorFn = theme.red;
            }
          }
        }

        console.log(letter, utilities.colorizePath(path.join(project.directory,
          file), colorFn));
      });

      cbEach(err);
    });
  });
});
