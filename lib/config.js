var fs = require('fs');
var ini = require('ini');
var _ = require('lodash');

var utilities = require('./utilities.js');

module.exports = {};

// TODO: Read GitHub config, hub config?
if (!fs.existsSync(utilities.CONFIG_FILE)) {
  return;
}

var defaults = require('../defaults.json');

// TODO: Error handling
var config = ini.parse(fs.readFileSync(utilities.CONFIG_FILE, 'utf-8'));

module.exports = _.merge(defaults, config);
