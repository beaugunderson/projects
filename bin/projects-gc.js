#!/usr/bin/env node

exports.command = {
  description: 'compact the projects database'
};

if (require.main !== module) {
  return;
}

var compact = require('dirty-compact').compact;
var util = require('util');

var utilities = require('../lib/utilities.js');

var backup = utilities.DATABASE_FILE + '.' + new Date().valueOf();

console.log(util.format('Backing up %s to %s',
  utilities.DATABASE_FILE, backup));

compact(utilities.DATABASE_FILE, backup, function (err) {
  if (err) {
    return console.error(util.format('Error compacting %s: %s',
      utilities.DATABASE_FILE, err));
  }

  console.log('Finished compacting', utilities.DATABASE_FILE);
});
