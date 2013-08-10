var dirty = require('dirty');
var query = require('dirty-query').query;
var util = require('util');
var _ = require('lodash');

var utilities = require('./utilities.js');

utilities.ensurePathsExist();

var db = exports.db = dirty(utilities.DATABASE_FILE);

exports.setup = function (cb) {
  db.on('load', function () {
    cb();
  });
};

var query = exports.query = _.partial(query, db);

var getProject = exports.getProject = function (name) {
  if (!name) {
    return null;
  }

  var results = query({
    name: {
      $regex: new RegExp('^' + name + '$', 'i')
    }
  });

  if (!results.length) {
    return null;
  }

  if (results.length > 1) {
    throw new Error('More than one result was returned!');
  }

  return _.first(results);
};

exports.getProjectOrDie = function (name) {
  var project = getProject(name);

  if (!project) {
    console.error('Project "%s" does not exist.', name);

    process.exit(1);
  }

  return project;
};

var updateProject = exports.updateProject =
  function (newProject, opt_insert, cb) {
  if (typeof opt_insert === 'function') {
    cb = opt_insert;
    opt_insert = false;
  }

  var oldProject = getProject(newProject.name);

  if (!oldProject) {
    if (!opt_insert) {
      throw new Error(util.format('Project "%s" was not found.',
        newProject.name));
    } else {
      oldProject = {};
    }
  }

  newProject = _.merge(oldProject, newProject);

  db.set(newProject.name, newProject, cb);
};

exports.upsertProject = function (newProject, cb) {
  updateProject(newProject, true, cb);
};

exports.all = function () {
  return query({});
};
