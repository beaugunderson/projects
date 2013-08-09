var fs = require('fs');
var ini = require('ini');
var path = require('path');

var utilities = require('./utilities.js');

fs.readFile(path.join(utilities.home, '.gitconfig'), 'utf-8',
  function (err, file) {
  var gitconfig = ini.parse(file);

  console.log(JSON.stringify(gitconfig, null, 2));
});
