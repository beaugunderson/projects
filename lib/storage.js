var dirty = require('dirty');
var query = require('dirty-query').query;
var util = require('util');
var _ = require('lodash');

var paths = require('./paths.js');
var utilities = require('./utilities.js');

utilities.ensurePathsExist();

var db = exports.db = dirty(paths.DATABASE_FILE);

exports.setup = function (cb) {
  db.on('load', function () {
    cb();
  });
};

var query = exports.query = _.partial(query, db);

var getProjectByDirectory = exports.getProjectByDirectory =
  function (directory) {
  // Check for the expanded directory
  var results = query({
    directory: {
      $equal: utilities.expand(directory)
    }
  });

  if (!results.length) {
    // Check for the contracted directory
    results = query({
      directory: {
        $equal: utilities.contract(directory)
      }
    });
  }

  if (results.length === 1) {
    return results[0];
  }
};

var getProject = exports.getProject = function (name) {
  if (!name) {
    return null;
  }

  if (utilities.isPath(name)) {
    return getProjectByDirectory(name);
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

var getProjectByDirectoryOrDie = exports.getProjectByDirectoryOrDie =
  function (directory) {
  var project = getProjectByDirectory(directory);

  if (!project) {
    console.error('Can\'t find a project with directory "%s" or "%s".',
      utilities.expand(directory),
      utilities.contract(directory));

    process.exit(1);
  }

  return project;
};

exports.getProjectOrDie = function (name) {
  var project;

  if (utilities.isPath(name)) {
    project = getProjectByDirectoryOrDie(name);
  } else {
    project = getProject(name);
  }

  if (!project) {
    console.error('Project "%s" does not exist.', name);

    process.exit(1);
  }

  return project;
};

var updateProject = exports.updateProject =
  function (name, updates, opt_insert, cb) {
  if (typeof opt_insert === 'function') {
    cb = opt_insert;
    opt_insert = false;
  }

  var project = getProject(name);

  if (!project) {
    if (utilities.isPath(name)) {
      throw new Error(util.format('"%s" is not a project directory.',
        utilities.expand(name)));
    }

    if (!opt_insert) {
      throw new Error(util.format('Project "%s" was not found.', name));
    } else {
      project = {};
    }
  }

  project = _.merge(project, updates);

  // Important to use project.name here because of case insensitivity
  db.set(project.name, project, function (err) {
    // Also return the updated project for convenience
    cb(err, project);
  });
};

exports.updateProjectOrDie = function (name, updates, cb) {
  updateProject(name, updates, function (err, project) {
    if (err) {
      console.error('Error updating projcet "%s": %s', name, err);

      process.exit(1);
    }

    cb(err, project);
  });
};

exports.upsertProject = function (name, updates, cb) {
  updateProject(name, updates, true, cb);
};

exports.all = function () {
  return query({});
};
