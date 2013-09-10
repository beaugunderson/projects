#!/usr/bin/env node

var helmsman = require('helmsman');

var program = helmsman({ usePath: true });

program.on('--help', function () {
  console.log('usage: projects [-h|--help] <command> ' +
    '[--color auto|always|never] [<args>]');
});

program.parse();
