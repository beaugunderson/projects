#!/usr/bin/env node

var program = require('commander');

var github = require('./github.js');
var query = require('./query.js');

require('pkginfo')(module);

program.version(module.exports.version);

program.option('--git-url-type [type]', 'The Git URL type to use ' +
  '[git, ssh, https]', 'https');

program.command('github')
  .description('fill your .projects with your GitHub repositories')
  .action(function () {
    github.fillProjects(function (err, repositories) {
      console.log(JSON.stringify(repositories, null, 2));
    });
  });

program.command('query [term]')
  .description('query your projects')
  .action(function (term) {
    query.query(term);
  });

program.parse(process.argv);
