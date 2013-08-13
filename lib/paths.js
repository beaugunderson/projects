var path = require('path');

var HOME = exports.HOME = process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE;

var CONFIG_BASE = exports.CONFIG_BASE = process.env.XDG_CONFIG_HOME ||
  path.join(HOME, '.config');

exports.CONFIG_FILE = path.join(CONFIG_BASE, 'projects');

exports.DATABASE_FILE = path.join(process.env.PROJECTS_DIRECTORY || CONFIG_BASE,
  'projects.db');
