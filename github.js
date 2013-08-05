var async = require('async');
var moment = require('moment');
var program = require('commander');
var request = require('request');
var _ = require('lodash');

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

var getRepositories = exports.getRepositories = function (cb) {
  var count;
  var page = 0;

  var allRepositories = [];

  async.until(function () {
    return count === 0;
  },
  function (cbUntil) {
    page++;

    request.get({
      url: "https://api.github.com/users/beaugunderson/repos",
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

exports.fillProjects = function (cb) {
  getRepositories(function (err, repositories) {
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

    cb(null, projects);
  });
};
