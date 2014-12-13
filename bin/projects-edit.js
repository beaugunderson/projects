#!/usr/bin/env node

// description: edit projects' own files
// arguments: config|db|database

var spawn = require('child_process').spawn;

var paths = require('../lib/paths.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('edit', 'config|db|database');

var file = program.args[0];

if (file === 'db' || file === 'database') {
  spawn(process.env.EDITOR,
    [paths.DATABASE_FILE],
    {stdio: 'inherit'}).on('close', process.exit);
} else if (file === 'config') {
  spawn(process.env.EDITOR,
    [paths.CONFIG_FILE],
    {stdio: 'inherit'}).on('close', process.exit);
} else {
  program.help();
}
