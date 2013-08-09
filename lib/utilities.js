var path = require('path');

var HOME = exports.HOME = process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE;

var CONFIG_BASE = exports.CONFIG_BASE = process.env.XDG_CONFIG_HOME ||
  path.join(HOME, '.config');

exports.CONFIG_FILE = path.join(CONFIG_BASE, 'projects');

exports.expand = function (string) {
  if (string.substr(0, 1) === '~') {
    string = path.join(process.env.HOME, string.substr(1));
  }

  return path.resolve(string);
};
