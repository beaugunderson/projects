#!/usr/bin/env node

exports.command = {
  description: 'compact the projects database'
};

if (require.main !== module) {
  return;
}

var compact = require('dirty-compact').compact;
var util = require('util');

var paths = require('../lib/paths.js');

var backup = paths.DATABASE_FILE + '.' + new Date().valueOf();

console.log(util.format('Backing up %s to %s',
  paths.DATABASE_FILE, backup));

compact(paths.DATABASE_FILE, backup, function (err) {
  if (err) {
    return console.error(util.format('Error compacting %s: %s',
      paths.DATABASE_FILE, err));
  }

  console.log('Finished compacting', paths.DATABASE_FILE);
});
