#!/usr/bin/env node

'use strict';

// TODO: this breaks anything that parses the output so we'll only want to do
// it if the output is going to a terminal (it also doesn't set the title
// entirely correctly in iTerm 2)
// process.stdout.write('\x1b]0;projects\x07');

var debug = require('debug')('projects');
var fs = require('fs');
var helmsman = require('helmsman');

var completion = require('../lib/completion.js');

var program = helmsman({
  usePath: true,
  fillCommandData: function (commandData, file) {
    var fileText = '';

    try {
      fileText = fs.readFileSync(file, 'utf8');
    } catch (e) {
      debug('unable to read %s', file);
    }

    var ARGUMENTS_RE = /arguments:\s+(.*)$/im;
    var DESCRIPTION_RE = /description:\s+(.*)$/im;

    var argumentMatches = fileText.match(ARGUMENTS_RE);
    var descriptionMatches = fileText.match(DESCRIPTION_RE);

    if (!argumentMatches && !descriptionMatches) {
      return null;
    }

    if (argumentMatches) {
      commandData.arguments = argumentMatches[1];
    }

    if (descriptionMatches) {
      commandData.description = descriptionMatches[1];
    }

    return commandData;
  },
  failOnRequireFail: false
});

program.on('--help', function () {
  console.log('usage: projects [-h|--help] <command> ' +
    '[--color auto|always|never] [<args>]');
});

completion(program.availableCommands, function () {
  program.parse();
});
