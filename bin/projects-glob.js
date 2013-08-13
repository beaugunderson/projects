#!/usr/bin/env node

exports.command = {
  description: 'glob the files in all projects',
  arguments: '<pattern>'
};

if (require.main !== module) {
  return;
}

var async = require('async');
var fs = require('fs');
var Glob = require('glob').Glob;
var path = require('path');
var program = require('commander');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

// XXX: Better way to word this?
program.option('-d, --dot', 'match files beginning with a . by default');

program.option('-f, --files', 'only match files');
program.option('--directories', 'only match directories');

program._name = 'glob';
program.usage('<command>');
program.parse(process.argv);

var options = {
  dot: program.dot
};

var pattern = program.args.join(' ');

storage.setup(function () {
  var projects = storage.query({ directory: { $has: true } },
    { sortBy: function (project) { return project.name.toLowerCase(); } });

  async.eachSeries(projects, function (project, cbEach) {
    var glob = new Glob(path.join(utilities.expand(project.directory),
      pattern), options);

    glob.on('match', function (match) {
      if (/node_modules/.test(match)) {
        return;
      }

      if (/\/\.git\//.test(match)) {
        return;
      }

      fs.stat(match, function (err, stats) {
        if ((stats.isFile() && !program.directories) ||
          (stats.isDirectory() && !program.files)) {
          console.log(match);
        }
      });
    });

    glob.on('error', function (err) {
      console.log('Error globbing projects:', err);

      process.exit(1);
    });

    glob.on('end', function () {
      cbEach();
    });
  });
});
