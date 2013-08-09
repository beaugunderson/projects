var dirty = require('dirty');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var query = require('dirty-query').query;
var _ = require('lodash');

var utilities = require('./utilities.js');

if (process.env.PROJECTS_DIRECTORY) {
  mkdirp.sync(process.env.PROJECTS_DIRECTORY);
}

if (!fs.existsSync(utilities.CONFIG_BASE)) {
  mkdirp.sync(utilities.CONFIG_BASE);
}

var database = path.join(process.env.PROJECTS_DIRECTORY ||
  utilities.CONFIG_BASE, 'projects.db');

var db = exports.db = dirty(database);

exports.setup = function (cb) {
  db.on('load', function () {
    cb();
  });
};

var query = exports.query = _.partial(query, db);

exports.getProject = function (project) {
  if (!project) {
    return null;
  }

  var results = query({
    name: {
      $regex: new RegExp('^' + project + '$', 'i')
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

exports.all = function () {
  return query({});
};
