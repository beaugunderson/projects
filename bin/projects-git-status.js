#!/usr/bin/env node

'use strict';

// description: git status across all repositories

var async = require('async');
var chalk = require('chalk');
var gift = require('gift');
var path = require('path');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('git-status');

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
          colorFn = chalk.red;
        } else if (status.type) {
          if (status.staged) {
            letter = _.padRight(status.type, 2);
            colorFn = chalk.yellow;
          } else {
            letter = _.padLeft(status.type, 2);

            if (status.type === 'M') {
              colorFn = chalk.green;
            } else if (status.type === 'D') {
              colorFn = chalk.red;
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
