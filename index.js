var defaultDirs = exports.path = [ __dirname + '/tasks' ];
if (__dirname != process.cwd()) defaultDirs.push(process.cwd() + '/tasks');

var Task = exports.Task = require('./lib/task');
var helper = exports.helper = require('./lib/helper');
var fs = require('fs');
var path = require('path');

var list = exports.list = function list(dirs) {
  if (typeof dirs == 'undefined') dirs = defaultDirs;
  var allTasks = {};
  function getPathTasks(dir) {
    dir = fs.realpathSync(dir);
    fs.readdirSync(dir).forEach(function(file) {
      var fileName = path.join(dir, file);
      var stats = fs.statSync(fileName);
      if (stats.isDirectory()) {
        addTasks(getPathTasks(fileName));
      } else if (stats.isFile()) {
        addTask(fileName);
      }
    });
  }
  function addTasks(tasks) {
    for (var task in tasks) {
      allTasks[task] = tasks[task];
    }
  }
  function addTask(file) {
    try {
      var module = require(file);
      if (module instanceof Task) {
        if (typeof allTasks[module.namespace] == 'undefined') {
          allTasks[module.namespace] = {};
        }
        allTasks[module.namespace][module.name] = module;
      } else {
        throw new Error('Module is not a valid Task object');
      }
    } catch (e) {
      helper.logError('Failed loading task "' + file + '": ' + (e.message || e));
    }
  }
  if (dirs instanceof Array) {
    dirs.forEach(function(dir) {
      addTasks(list(dir));
    });
  } else {
    addTasks(getPathTasks(dirs));
  }
  return allTasks;
}

var find = exports.find = function(name, dirs) {
  var tasks = list(dirs);
  for (var ns in tasks) {
    for (var key in tasks[ns]) {
      var task = tasks[ns][key];
      if (task.matchName(name)) {
        return task;
      }
    }
  }
  throw new Error('Unknown task "' + name + '"');
}
