const TASKS_DIR = 'tasks';

const Task = exports.Task = require('./lib/task');
const helper = exports.helper = require('./lib/helper');

const fs = require('fs');
const path = require('path');

const cachedLists = {};
const list = exports.list = function list(dirs, forceRefresh) {
  if (typeof forceRefresh == 'undefined') forceRefresh = false;
  dirs = tasksDirectories(dirs);
  var key = JSON.stringify(dirs);
  if (typeof cachedLists[key] != 'undefined' && !forceRefresh) return cachedLists[key];

  var failedTasks = 0;
  var allTasks = {};
  dirs.forEach(function(dir) { addTasks(getPathTasks(dir)) });
  cachedLists[key] = allTasks;
  if (failedTasks > 0 && !helper.debugMode) {
    console.log(helper.colorize('Warning:', 'yellow', helper.style.BOLD) + ' ' + failedTasks + ' task' + (failedTasks > 1 ? 's' : '') + ' failed loading. Run "NODE_DEBUG=1 jus …" for more information' + '\n');
  }
  return allTasks;

  function getPathTasks(dir) {
    if (!helper.exists(dir)) return false;
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
      failedTasks ++;
      if (helper.debugMode) {
        helper.logError('Failed loading task "' + file + '": ' + (e.message || e));
      }
    }
  }
}

const find = exports.find = function(name, dirs) {
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

const runCLI = exports.runCLI = function(argv) {
  // Browse arguments to extract task
  var task = null;
  for (var i=0; i<argv.length; i++) {
    if (!argv[i].match(/^-/)) {
      task = find(argv[i]);
      break;
    }
  }
  if (!task) { // No argument for a task, or we would have found a task OR thrown an exception
    throw new Error('Arguments expected');
  }
  // Parse argv and execute task
  var opts = {}, args = [];
  (function() {
    var optionExpectingValue = null, skippedFirstArgument = false;
    for (var i=0; i<argv.length; i++) {
      var opt = argv[i];
      if (opt.match(/^-/)) { // Short or long option
        if (optionExpectingValue !== null) {
          throw new Error('Error at "' + opt + '", previous option "' + optionExpectingValue + '" was expecting an argument');
        }
        var optName = opt.substring(1), optVal = undefined;
        if (opt.match(/^--/)) { // Long option
          optName = opt.substring(2);
          var eqPos = opt.indexOf('=');
          if (eqPos != -1) {
            optName = opt.substring(2, eqPos);
            optVal = parseOptValue(opt.substring(eqPos+1));
          }
        } else { // Short option
          if (optName.length > 1) {
            optName = optName.substring(0, 1);
            optVal = parseOptValue(optName.substring(1));
          }
        }
        var option = task.getOption(optName);
        if (!option) {
          throw new Error('Unexpected "' + opt + '"');
        }
        if (option.expectsValue && optVal === undefined) {
          optionExpectingValue = optName;
        }
        opts[optName] = optVal;
      } else { // Argument
        if (optionExpectingValue !== null) {
          opts[optionExpectingValue] = parseOptValue(opt);
          optionExpectingValue = null;
        } else {
          if (!skippedFirstArgument) { // Skip first argument, as it's the task name
            skippedFirstArgument = true;
          } else {
            args.push(parseOptValue(opt));
          }
        }
      }
    }
  })();
  task.execute(opts, args);
}

function parseOptValue(v) {
  if (v == 'false') return false;
  if (v == 'null')  return null;
  if (v == 'true')  return true;
  return v;
}

const tasksDirectories = exports.tasksDirectories = function(roots) {
  if (typeof roots == 'undefined') roots = [process.cwd(), __dirname];
  if (!(roots instanceof Array)) roots = [roots];
  roots = unique(roots);
  // We'll search for "tasks" folders in roots + every module locally installed in these roots
  var dirs = [];
  // Every tasks dir in root
  roots.forEach(function(root) { if (path.basename(root) == TASKS_DIR) dirs.push(root); });
  // <root>/tasks
  new helper.Finder().type(helper.Finder.DIR).names('tasks').depth(1, 1).fetchSync(roots).forEach(function(dir) { dirs.push(dir); });
  // <root>/node_modules/<module>/tasks
  var modules = new helper.Finder().type(helper.Finder.DIR).names('node_modules').depth(1,1).fetchSync(roots);
  new helper.Finder().type(helper.Finder.DIR).names('tasks').depth(2, 2).fetchSync(modules).forEach(function(dir) { dirs.push(dir); });
  return unique(dirs);
}

function unique(array) {
  var newArray = [];
  loop1:for (var i=0; i<array.length; i++) {
    for (var j=0; j<newArray.length; j++) {
      if (newArray[j] == array[i]) continue loop1;
    }
    newArray.push(array[i]);
  }
  return newArray;
}
