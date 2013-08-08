#!/usr/bin/env node

exports.command = {
  description: 'fill your .projects with your GitHub repositories'
};

var async = require('async');
var moment = require('moment');
var program = require('commander');
var request = require('request');
var _ = require('lodash');

var projectsFile = require('../lib/projectsFile.js');

var ATTRIBUTES = [
  'name',
  'description',
  'homepage',
  'language',
  'created_at',
  'updated_at',
  'pushed_at',
  'fork',
  'private',
  'html_url',
  'git_url',
  'ssh_url',
  'clone_url'
];

var GITHUB_URL_MAPPINGS = {
  git: 'git_url',
  https: 'clone_url',
  ssh: 'ssh_url'
};

var SIX_MONTHS_AGO = moment().subtract('months', 6);

var getRepositories = exports.getRepositories = function (username, cb) {
  var count;
  var page = 0;

  var allRepositories = [];

  async.until(function () {
    return count === 0;
  },
  function (cbUntil) {
    page++;

    request.get({
      url: 'https://api.github.com/users/' + username + '/repos',
      json: true,
      qs: {
        page: page
      }
    }, function (err, resp, repositories) {
      repositories = _.map(repositories, function (repo) {
        return _.pick(repo, ATTRIBUTES);
      });

      allRepositories.push.apply(allRepositories, repositories);

      count = repositories.length;

      cbUntil(err);
    });
  },
  function (err) {
    cb(err, allRepositories);
  });
};

function isActive(repository) {
  var updated = moment(repository.updated_at);
  var pushed = moment(repository.pushed_at);

  return (updated && updated.isAfter(SIX_MONTHS_AGO)) ||
    (pushed && pushed.isAfter(SIX_MONTHS_AGO));
}

var fillProjects = exports.fillProjects = function (username, cb) {
  getRepositories(username, function (err, repositories) {
    var projects = [];

    repositories.forEach(function (repository) {
      var project = {
        name: repository.name,
        repository: repository[GITHUB_URL_MAPPINGS[program.gitUrlType]],
        homepage: repository.homepage || repository.html_url,
        language: repository.language,
        role: repository.fork ? 'contributor' : 'creator',
        released: !repository.private,
        status: isActive(repository) ? 'active' : 'inactive'
      };

      projects.push(project);
    });

    cb(err, projects);
  });
};

if (require.main === module) {
  program.option('--git-url-type [type]', 'The Git URL type to use ' +
    '[git, ssh, https]', 'https');

  program.parse(process.argv);

  projectsFile.get(function (projects) {
    fillProjects(projects.meta.github.username, function (err, repositories) {
      if (err) {
        console.log('There was an error accessing your GitHub data:', err);

        process.exit(1);
      }

      console.log(JSON.stringify(repositories, null, 2));
    });
  });
}
