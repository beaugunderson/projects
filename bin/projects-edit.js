#!/usr/bin/env node

exports.command = {
  description: 'edit projects\' own files',
  arguments: '<project>'
};

if (require.main !== module) {
  return;
}

var spawn = require('child_process').spawn;

var paths = require('../lib/paths.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaults('edit', '<file>');

program.parse(process.argv);

var file = program.args[0];

if (file === 'db' || file === 'database') {
  spawn(process.env.EDITOR,
    [paths.DATABASE_FILE],
    { stdio: 'inherit' }).on('close', process.exit);
} else if (file === 'config') {
  spawn(process.env.EDITOR,
    [paths.CONFIG_FILE],
    { stdio: 'inherit' }).on('close', process.exit);
}
