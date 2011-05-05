// TODO

exports.Task = require('./task');

/*
require('./task');

function getTasks(dirs) {
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
    var module = require(file);
    try {
      checkTask(module, file);
    } catch (err) {
      cli.fatal("Failed loading task '" + file + "': " + err);
    }
    if (typeof allTasks[module.namespace] == 'undefined') {
      allTasks[module.namespace] = {};
    }
    allTasks[module.namespace][module.name] = module;
  }
  function checkTask(module, file) {
    if (typeof module.namespace != 'string') throw "Attribute 'namespace' must be a string (mandatory)";
    if (typeof module.execute != 'function') throw "Attribute 'execute' must be a function (mandatory)";
    var keyName = path.basename(file, '.js');
    if (typeof module.name == 'undefined') {
      module.name = path.basename(file, '.js');
      cli.debug("Task does not define a name in '" + file + "', used default name '" + module.name + "'");
    }
    if (typeof module.name != 'string') throw "Attribute 'name' must be a string (optional)";
    if (typeof module.options == 'undefined') module.options = {};
    if (typeof module.options != 'object') throw "Attribute 'options' must be an object (optional)";
    if (typeof module.arguments == 'undefined') module.arguments = {};
    if (typeof module.arguments != 'object') throw "Attribute 'arguments' must be an object (optional)";
    if (typeof module.description == 'undefined') module.description = 'coucou\ngamin';
    if (typeof module.description != 'string') throw "Attribute 'description' must be a string (optional)";
    if (typeof module.shortDescription == 'undefined') {
      if (module.description.indexOf('\n') != -1) {
        module.shortDescription = module.description.substring(0, module.description.indexOf('\n'));
      } else {
        module.shortDescription = module.description;
      }
    }
    if (typeof module.shortDescription != 'string') throw "Attribute 'shortDescription' must be a string (optional)";
    if (module.shortDescription.indexOf('\n') != -1) {
      cli.debug("Task has a multi-line short description in '" + file + "', only first line will be visible");
      module.shortDescription = module.shortDescription.substring(0, module.shortDescription.indexOf('\n'));
    }
    if (typeof module.shortcut != 'undefined' && typeof module.shortcut != 'string') throw "Attribute 'shortcut' must be a string (optional)";
  }
  if (dirs instanceof Array) {
    dirs.forEach(function(dir) {
      addTasks(getTasks(dir));
    });
  } else {
    addTasks(getPathTasks(dirs));
  }
  return allTasks;
}

var PATHS = [__dirname+'/../tasks', './tasks'];

var fs = require('fs');
var path = require('path');

console.log(
  cli.colorize('coucou gamin', 'black', cli.style.BOLD + cli.style.UNDERLINE, 'green')
  + '|'
  + cli.colorize('coucou gamin', 'black', cli.style.BOLD, 'white')
  + '|'
  + cli.colorize('coucou gamin', 'black', cli.style.NORMAL, 'white'));

// Set app info
var packageJson = __dirname + '/../package.json';
if (fs.statSync(packageJson).isFile()) {
  cli.setApp(packageJson);
} else {
  cli.setApp('jizzy', VERSION);
}

// Parse opts
cli.parse({
  "list":    ['l', 'List available tasks'],
  "version": ['v', 'Show current version'],
});

// Execute
cli.main(function(args, options) {

  if (options.version) {
    cli.ok(cli.version);
    process.exit(0);
  }

  if (options.paths) {
    options.paths.split(':').forEach(function(path) {
      PATHS.push(path);
    });
  }

  // Get tasks
  var tasks = getTasks(PATHS);

  if (args.length == 0) {
    showTasks(tasks);
  } else {
    executeTask(args, options);
  }
});

function showTasks(tasks) {
  var usage = cli.app + ' [OPTIONS] <task> [ARGS]';
  console.log('\x1b[1mUsage\x1b[0m:\n  ' + usage + '\n');
  console.log('\x1b[1mAvailable tasks\x1b[0m:');
  Object.keys(tasks).sort().forEach(function(ns) {
    console.log('\x1B[33m' + ns + '\x1B[0m');
    Object.keys(tasks[ns]).sort().forEach(function(name) {
      var task = tasks[ns][name];
      var name = task.name;
      while (name.length < 20) name += ' ';
      console.log('  \x1B[32m:' + name + '\x1B[0m' + task.shortDescription);
    });
  });
}
function executeTask(args, options) {
  var name = args.shift();
  console.log(name);
}

// Exports
module.exports = {
  "list": list,
  "run":  run
};
*/
