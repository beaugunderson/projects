#!/usr/bin/env node

'use strict';

// description: fill your projects.db from GitHub

var async = require('async');
var moment = require('moment');
var request = require('request');
var _ = require('lodash');

var config = require('../lib/config.js');
var paths = require('../lib/paths.js');
var storage = require('../lib/storage.js');
var utilities = require('../lib/utilities.js');

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

var SIX_MONTHS_AGO = moment().subtract(6, 'months');

var GITHUB_BASE_URL = 'https://api.github.com';

var program = utilities.programDefaults('github');

program.option('--url-type [type]', 'The Git URL type to use ' +
  '[git, ssh, https]', 'https');

program.option('-u, --username', 'The GitHub username');

program.parse(process.argv);

if ((!program.username && !config.github.username) &&
  !config.github.access_token) {
  console.error('Please specify a GitHub username or an access_token in',
    paths.CONFIG_FILE, 'or a username via the -u, --username flag.');

  process.exit(1);
}

var username = program.username || config.github.username;

var getRepositories = exports.getRepositories = function (cb) {
  var count;
  var page = 0;

  var allRepositories = [];

  async.until(function () {
    return count === 0;
  },
  function (cbUntil) {
    page++;

    console.log('Retrieving repositories page', page);

    var qs = {
      page: page
    };

    var url = GITHUB_BASE_URL;

    if (config.github.access_token) {
      url += '/user/repos';

      qs.access_token = config.github.access_token;
    } else {
      url += '/users/' + username + '/repos';
    }

    request.get({
      url: url,
      qs: qs,
      headers: {
        'User-Agent': username
      },
      json: true
    }, function (err, resp, repositories) {
      repositories = _.map(repositories, function (repo) {
        return _.pick(repo, ATTRIBUTES);
      });

      allRepositories = allRepositories.concat(repositories);

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

var fillProjects = exports.fillProjects = function (cb) {
  getRepositories(function (err, repositories) {
    var projects = [];

    repositories.forEach(function (repository) {
      var project = {
        name: repository.name,
        description: repository.description,
        repository: repository[GITHUB_URL_MAPPINGS[program.urlType]],
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

storage.setup(function () {
  console.log('Filling projects from GitHub');

  fillProjects(function (err, projects) {
    if (err) {
      console.log('There was an error accessing your GitHub data:', err);

      process.exit(1);
    }

    async.forEachSeries(projects, function (project, cbForEach) {
      console.log('Adding', project.name);

      storage.upsertProject(project.name, project, cbForEach);
    });
  });
});
