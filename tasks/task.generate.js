const path = require('path');
const fs = require('fs');
const tasks = require('..');

const TEMPLATE = ""
  + "{{WARNING}}"
  + "\n"
  + "// Require tasks manager module, the best one has been selected depending on your environment\n"
  + "{{COMMENT_JUS_TASK}}const tasks = require('{{PATH_JUS_TASK}}'); // Direct dependency with 'jus-task'\n"
  + "{{COMMENT_JUS}}const tasks = require('{{PATH_JUS}}').tasks; // Got from dependency with 'jus'\n"
  + "\n"
  + "const helper = tasks.helper;\n"
  + "const Task = tasks.Task;\n"
  + "\n"
  + "module.exports = new Task({\n"
  + "  \"namespace\":        '{{NAMESPACE}}',\n"
  + "  \"name\":             '{{NAME}}',\n"
  + "  \"aliases\":          {{ALIASES}},\n"
  + "  \"description\":      'Long description for your task\\nthat can be multi-line',\n"
  + "  \"shortDescription\": 'Short description for your task',\n"
  + "  \"configure\":        function() {\n"
  + "    this.addOption({\"name\":'foo', \"shortName\":'f', \"mandatory\":false, \"default\":'bar'});\n"
  + "    this.addArgument({\"name\":'baz', \"mandatory\":false, \"default\":'some value'});\n"
  + "  },\n"
  + "  \"execute\":          function(opts, args) {\n"
  + "    helper.logSection('option', 'foo = ' + opts.foo);\n"
  + "    helper.logSection('argument', 'baz = ' + args.baz);\n"
  + "  }\n"
  + "});\n";

module.exports = new tasks.Task({
  "namespace": 'task',
  "name": 'generate',
  "aliases": ['gen-task'],
  "description": 'Use this task to generate skeleton for new tasks.\n'
               + 'This task will create a file in a directory "tasks" into current working directory.'
               + 'Example:\n'
               + '\n'
               + '    jus task:generate hello kitty\n'
               + '\n'
               + 'will generate a file named "tasks/hello.kitty.js" declaring a new task.\n'
               + 'You should then see it when you run\n'
               + '\n'
               + '    jus list hello',
  "shortDescription": "Generate skeleton for new task",
  "configure": function() {
    this.addOption({"name":'file', "shortName":'f', "mandatory":false, "default":null, "description":'Create this file name instead of "<namespace>.<name>.js"'});
    this.addOption({"name":'aliases', "shortName":'a', "mandatory":false, "default":'', "description":'Define non-namespaced aliases for your task (comma-separated)'});
    this.addArgument({"name":'namespace', "mandatory":true, "description":'Namespace of your task'});
    this.addArgument({"name":'name', "mandatory":true, "description":'Name of your task'});
  },
  "execute": function(opts, args) {
    var file = opts.file || (args.namespace + '.' + args.name + '.js');
    if (!file.match(/\.js$/)) file += '.js';
    file = path.join('tasks', file);
    var aliases = JSON.stringify(opts.aliases.split(/\s*,\s*/).filter(function(alias) {
      return alias.match(/^[a-z][a-z0-9\-_]*$/i);
    }));
    var tokens = {
      "{{NAME}}":             args.name,
      "{{NAMESPACE}}":        args.namespace,
      "{{ALIASES}}":          aliases,
      "{{COMMENT_JUS_TASK}}": '// ',
      "{{PATH_JUS_TASK}}":    'jus-task',
      "{{COMMENT_JUS}}":      '// ',
      "{{PATH_JUS}}":         'jus',
      "{{WARNING}}":          '',
    }
    var found = checkJusTaskDependency();
    if (found) {
      var isGlobal = found.charAt(0) == '/';
      if (isGlobal) {
        // Add warning
        tokens['{{WARNING}}'] = 'console.log("\x1b[1;33mYou should install dependencies locally and edit ' + file + ' to fix require()\x1b[0m");\n';
      }
      if (path.basename(found) == 'jus') { // jus
        tokens['{{PATH_JUS}}'] = found;
        tokens['{{COMMENT_JUS}}'] = '';
      } else { // jus-task
        tokens['{{PATH_JUS_TASK}}'] = found;
        tokens['{{COMMENT_JUS_TASK}}'] = '';
      }
    } else {
      tokens['{{WARNING}}'] = 'console.log("\x1b[1;37;41mYou must edit ' + file + ' to add the proper require()\x1b[0m");\nreturn false;\n';
    }
    switch (found) {
      case 'local':
        tokens['{{COMMENT_LOCAL}}'] = '';
        tokens
        break;
      case 'jus':
        tokens['{{COMMENT_JUS}}'] = '';
        break;
      default:
        tokens['{{COMMENT_GLOBAL}}'] = '';
        tokens['{{PATH_JUS_TASK}}'] = found;
        break;
    }
    tasks.helper.token(file, tokens, TEMPLATE);
  }
});

function checkJusTaskDependency() {
  var globalPrefix = '/usr/local/lib'; // TODO use npm to find prefix
  function findModule(module, root) {
    root = root || '.';
    // Check local installation
    if (!path.existsSync(path.join(root, path.join('node_modules', module)))) {
      // module is not found
      if (!path.existsSync('package.json')) {
        // no package.json found
        tasks.helper.log('Dependency to ' + module + ': No "package.json" found', tasks.helper.level.WARNING);
        return 'no package.json';
      } else {
        var packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
        if (typeof packageJson.dependencies[module] == 'undefined') {
          // package.json found, but module is not declared as a dependency
          tasks.helper.log('Dependency to ' + module + ': Dependency not found in "package.json"', tasks.helper.level.WARNING);
          return 'no dependency';
        } else {
          // package.json found, and module is declared as a dependency: notice user to npm install ;)
          tasks.helper.log('Dependency to ' + module + ': Dependency found in "package.json", but module not found, run "npm install"', tasks.helper.level.WARNING);
          return 'no npm install';
        }
      }
    } else {
      // Module is found locally
      tasks.helper.logSection('Dependency', 'Will use ' + module + ' from ' + root + ' (you can ignore previous warnings)');
      return 'yes';
    }
  }
  // Check local modules
  if (findModule('jus-task', process.cwd()) == 'yes') return 'jus-task';
  if (findModule('jus', process.cwd())      == 'yes') return 'jus';
  // Not found locally: search globally (as this is not a good idea, we'll add a warning)
  tasks.helper.log('Dependencies: "jus" or "jus-task" not found locally, try globally…', tasks.helper.level.WARNING);
  if (findModule('jus-task', globalPrefix)  == 'yes') return path.join(globalPrefix, path.join('node_module', 'jus'));
  if (findModule('jus', globalPrefix)       == 'yes') return path.join(globalPrefix, path.join('node_module', 'jus'));
  // Nope, you really need to install it
  tasks.helper.log('Dependencies: Install "jus" or "jus-task" and edit the generated task to resolve dependency !', tasks.helper.level.ERROR);
  return false;
}
