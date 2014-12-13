#!/usr/bin/env node

'use strict';

var fs = require('fs');
var helmsman = require('helmsman');
var omelette = require('omelette');
var _ = require('lodash');

var storage = require('../lib/storage.js');

var program = helmsman({
  usePath: true,
  fillCommandData: function (commandData, file) {
    var fileText = fs.readFileSync(file, 'utf8');

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

var names = _.keys(program.availableCommands);

var args = _.mapValues(program.availableCommands, function (command) {
  return command.arguments ? command.arguments.split(/\s+/) : [];
});

var complete = omelette('projects|p');

var completions = {
  'sub-command': _.constant(names),
  attribute: function () {
    return _(storage.all())
      .map(function (project) {
        return _.keys(project);
      })
      .flatten()
      .uniq()
      .valueOf();
  },
  project: function () {
    return _.pluck(storage.all(), 'name');
  }
};

complete.on('complete', function (fragment, word, line) {
  var tokens = line.split(/\s+/)
    // Remove the command's name (projects or p)
    .slice(1)
    // Remove options like -h, --color, etc.
    .filter(function (token) {
      return !token.match(/^\s*-/);
    });

  var position = tokens.length - 2;

  // If we haven't yet completed the first command then list the commands
  if (tokens.length <= 1) {
    return this.reply(names);
  }

  // If the user chooses a command we don't know about then return nothing
  if (!args[tokens[0]]) {
    return this.reply([]);
  }

  var commandArgs = args[tokens[0]];

  // If the user tries to complete more args than we know about return nothing
  if (position > commandArgs.length - 1) {
    return this.reply([]);
  }

  // The type of command we're completing: project, attribute, etc.
  var type = commandArgs[position].replace(/[<>\[\]]/g, '');

  // Support arguments like option1|option2|option3
  if (type.indexOf('|') !== -1) {
    return this.reply(type.split('|'));
  }

  if (completions[type]) {
    // Return the potential completions
    return this.reply(completions[type](tokens.pop()) || []);
  }

  this.reply([]);
});

// Set up storage first so that completion can return results from storage
storage.setup(function () {
  complete.init();

  program.on('--help', function () {
    console.log('usage: projects [-h|--help] <command> ' +
      '[--color auto|always|never] [<args>]');
  });

  program.parse();
});
