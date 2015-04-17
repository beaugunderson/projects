#!/usr/bin/env node

'use strict';

// description: git status across all repositories

var async = require('async');
var chalk = require('chalk');
var gift = require('gift');
var path = require('path');
var _ = require('lodash');

_.str = require('underscore.string');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('git-status');

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var repo = gift(utilities.expand(project.directory));

    repo.status(function (err, status) {
      if (status.clean) {
        return cbEach();
      }

      _.each(status.files, function (status, file) {
        var letter;
        var color;

        if (!status.tracked) {
          letter = '??';
          color = chalk.red;
        } else if (status.type) {
          if (status.staged) {
            letter = _.padRight(status.type, 2);
            color = chalk.yellow;
          } else {
            letter = _.padLeft(status.type, 2);

            if (status.type === 'M') {
              color = chalk.green;
            } else if (status.type === 'D') {
              color = chalk.red;
            }
          }
        }

        console.log(letter, utilities.colorizePath(path.join(project.directory,
          file), color));
      });

      cbEach(err);
    });
  });
});
