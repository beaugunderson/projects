var fs = require('fs');
var path = require('path');

var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

exports.get = function (cb) {
  var projectsFile;

  if (process.env.PROJECTS_FILE) {
    projectsFile = process.env.PROJECTS_FILE;
  } else {
    projectsFile = path.join(HOME, '.projects.json');
  }

  fs.exists(projectsFile, function (exists) {
    if (!exists) {
      console.error('You need a ~/projects.json file.');

      process.exit(1);
    }

    var projects;

    try {
      projects = require(projectsFile);
    } catch (e) {
      console.error('Error opening', projectsFile, ':', e);

      process.exit(1);
    }

    cb(projects);
  });
};
