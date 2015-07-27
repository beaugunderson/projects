#!/usr/bin/env node

'use strict';

// description: show the JSON for a given project
// arguments: <project>

var cardinal = require('cardinal');

var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

var program = utilities.programDefaultsParse('info', '<project>');
var theme = program.theme;

var cardinalTheme = {
  Boolean: {
    true: undefined,
    false: undefined,
    _default: theme.primary
  },

  Identifier: {
    _default: theme.primary
  },

  Null: {
    _default: theme.bad
  },

  Numeric: {
    _default: theme.primary
  },

  String: {
    _default: function (s, info) {
      var nextToken = info.tokens[info.tokenIndex + 1];

      // show keys of object literals and json in different color
      return (nextToken &&
              nextToken.type === 'Punctuator' &&
              nextToken.value === ':') ? theme.primary(s)
                                      : theme.secondary(s);
    }
  },

  Keyword: {
    _default: theme.primary
  },

  Punctuator: {
    ';': theme.neutral,
    '.': theme.primary,
    ',': theme.primary,
    '{': theme.highlight,
    '}': theme.highlight,
    '[': theme.highlight,
    ']': theme.highlight,
    _default: theme.neutral
  },

  _default: undefined
};

storage.setup(function () {
  if (!program.args.length) {
    console.error('Please specify a project.');

    process.exit(1);
  }

  var project = storage.getProjectOrDie(program.args[0]);

  var output = JSON.stringify(project, null, 2);

  if (program.supportsColor) {
    console.log(cardinal.highlight(output, {theme: cardinalTheme, json: true}));
  } else {
    console.log(output);
  }
});
