#!/usr/bin/env node

'use strict';

// description: glob the files in all projects
// arguments: <pattern>

require('log-buffer');

var async = require('async');
var Glob = require('glob').Glob;
var path = require('path');
var _ = require('lodash');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('glob', '<command>');

program.option('--dot', 'match files beginning with a .');
program.option('-d, --directories', 'only match directories');
program.option('-e, --expand', 'expand path names');
program.option('-f, --files', 'only match files');
program.option('-n, --no-filter', 'don\'t filter .git, node_modules');
program.option('-0, --null', 'behave like `find -print0`');

program.parse(process.argv);

if (program.files && program.directories) {
  console.error('You can only specify either --files or --directories');

  process.exit(1);
}

var globOptions = {
  dot: program.dot,
  nosort: true
};

if (program.files || program.directories) {
  globOptions.stat = true;
}

var pattern = program.args.join(' ');

var statTest = program.directories ? 'isDirectory' : 'isFile';

var filterMatch = !program.filter ? _.constant() : function (match) {
  return match.indexOf('/node_modules/') > -1 ||
         match.indexOf('/.git/') > -1;
};

var printLine = !program.null ? console.log : function (value) {
  process.stdout.write(value + '\u0000');
};

function printMatch(match, stat) {
  if (filterMatch(match)) {
    return;
  }

  if (stat && !stat[statTest]()) {
    return;
  }

  if (program.expand) {
    printLine(utilities.expand(match));

    return;
  }

  printLine(utilities.contract(match));
}

storage.setup(function () {
  var projects = storage.allWithDirectory();

  async.eachSeries(projects, function (project, cbEach) {
    var globPattern = path.join(utilities.expand(project.directory), pattern);
    var glob = new Glob(globPattern, globOptions);
    var event = 'match';

    if (program.files || program.directories) {
      event = 'stat';
    }

    glob.on(event, printMatch);

    glob.on('error', function (err) {
      console.error('Error globbing projects:', err);

      process.exit(1);
    });

    glob.on('end', _.partial(cbEach, null));
  });
});
