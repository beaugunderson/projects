var fs = require('fs');
var ini = require('ini');
var _ = require('lodash');

var defaults = require('../defaults.json');
var paths = require('./paths.js');

module.exports = defaults;

// TODO: Read GitHub config, hub config?
if (!fs.existsSync(paths.CONFIG_FILE)) {
  return;
}

// TODO: Error handling
var config = ini.parse(fs.readFileSync(paths.CONFIG_FILE, 'utf-8'));

module.exports = _.merge(module.exports, config);
