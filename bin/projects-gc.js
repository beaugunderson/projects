#!/usr/bin/env node

'use strict';

// description: compact the projects database

var compact = require('dirty-compact').compact;

var paths = require('../lib/paths.js');

var backup = paths.DATABASE_FILE + '.' + new Date().valueOf();

console.log('Backing up %s to %s', paths.DATABASE_FILE, backup);

compact(paths.DATABASE_FILE, backup, function (err) {
  if (err) {
    return console.error('Error compacting %s: %s', paths.DATABASE_FILE, err);
  }

  console.log('Finished compacting', paths.DATABASE_FILE);
});
