var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var HOME = exports.HOME = process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE;

var CONFIG_BASE = exports.CONFIG_BASE = process.env.XDG_CONFIG_HOME ||
  path.join(HOME, '.config');

exports.CONFIG_FILE = path.join(CONFIG_BASE, 'projects');

exports.DATABASE_FILE = path.join(process.env.PROJECTS_DIRECTORY || CONFIG_BASE,
  'projects.db');

exports.ensurePathsExist = function () {
  if (process.env.PROJECTS_DIRECTORY) {
    mkdirp.sync(process.env.PROJECTS_DIRECTORY);
  }

  if (!fs.existsSync(CONFIG_BASE)) {
    mkdirp.sync(CONFIG_BASE);
  }
};

exports.expand = function (string) {
  if (string.substr(0, 1) === '~') {
    string = path.join(process.env.HOME, string.substr(1));
  }

  return path.resolve(string);
};
