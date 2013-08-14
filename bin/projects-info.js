#!/usr/bin/env node

exports.command = {
  description: 'show the JSON for a given project',
  arguments: '<project>'
};

if (require.main !== module) {
  return;
}

var cardinal = require('cardinal');
var hasColor = require('has-color');
var program = require('commander');

var storage = require('../lib/storage.js');

program.option('-c, --color [when]', 'color the output [auto]', 'auto');

program._name = 'info';
program.usage('<project>');
program.parse(process.argv);

storage.setup(function () {
  if (!program.args.length) {
    console.error('Please specify a project.');

    process.exit(1);
  }

  var project = storage.getProjectOrDie(program.args[0]);

  var output = JSON.stringify(project, null, 2);

  if ((program.color === 'auto' && hasColor) ||
    program.color === 'always') {
    console.log(cardinal.highlight(output, { json: true }));
  } else {
    console.log(output);
  }
});
