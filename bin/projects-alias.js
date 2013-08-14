#!/usr/bin/env node

exports.command = {
  description: 'output shell aliases',
  arguments: '[alias]'
};

if (require.main !== module) {
  return;
}

var fs = require('fs');
var path = require('path');
var program = require('commander');

program._name = 'edit';
program.usage('<file>');
program.parse(process.argv);

process.stdout.on('error', function (err) {
  if (err.code !== 'EPIPE') {
    process.exit(1);
  }
});

fs.createReadStream(path.resolve(__dirname, '../shell/pcd.sh'))
  .pipe(process.stdout);
