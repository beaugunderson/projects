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

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('glob', '<command>');

// XXX: Better way to word this?
program.option('--dot', 'match files beginning with a . by default');
program.option('-d, --directories', 'only match directories');
program.option('-f, --files', 'only match files');
program.option('-n, --no-filter', 'don\'t filter .git, node_modules');

program.parse(process.argv);

var options = {
  dot: program.dot
};

var pattern = program.args.join(' ');

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var glob = new Glob(path.join(utilities.expand(project.directory),
      pattern), options);

    glob.on('match', function (match) {
      if (!program.noFilter && (/node_modules/.test(match) ||
        /\/\.git\//.test(match))) {
        return;
      }

      fs.stat(match, function (err, stats) {
        // Sometimes there are broken symlinks
        if (err && err.code === 'ENOENT') {
          return console.log(utilities.contract(match));
        } else if (err) {
          throw err;
        }

        if ((stats.isFile() && !program.directories) ||
          (stats.isDirectory() && !program.files)) {
          console.log(utilities.contract(match));
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
