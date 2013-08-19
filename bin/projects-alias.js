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

var utilities = require('../lib/utilities.js');

utilities.programDefaultsParse('alias', '<file>');

process.stdout.on('error', function (err) {
  if (err.code !== 'EPIPE') {
    process.exit(1);
  }
});

fs.createReadStream(path.resolve(__dirname, '../shell/pcd.sh'))
  .pipe(process.stdout);
