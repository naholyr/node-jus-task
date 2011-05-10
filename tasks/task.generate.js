const path = require('path');
const fs = require('fs');
const tasks = require('..');

const TEMPLATE = ""
  + "const tasks = require('jus-task');\n"
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
    }
    tasks.helper.token(file, tokens, TEMPLATE, function() {
      tasks.helper.log('OK', tasks.helper.level.INFO);
    });
    hintJusTaskDependency();
  }
});

function hintJusTaskDependency() {
  // Check local installation
  tasks.helper.exists(path.join('node_modules', 'jus-task'), function(err, dirExists) {
    if (err) throw err;
    if (!dirExists) {
      // Module is not found
      tasks.helper.exists('package.json', function(err, fileExists) {
        if (err) throw err;
        if (!fileExists) {
          // No package.json found
          tasks.helper.log('Failed resolving dependency to jus-task, and no "package.json" found: you should "npm install jus-task" or "npm init" and declare dependency', tasks.helper.level.WARNING);
        } else {
          // Found package.json: check dependency
          tasks.helper.read('package.json', function(err, content) {
            if (err) throw err;
            var packageJson = JSON.parse(content);
            if (typeof packageJson.dependencies['jus-task'] == 'undefined') {
              // package.json found, but module is not declared as a dependency
              tasks.helper.log('Failed resolving dependency to jus-task, you should edit your "package.json" and add dependency to "jus-task", then "npm install"', tasks.helper.level.WARNING);
            } else {
              // package.json found, and module is declared as a dependency: notice user to npm install ;)
              tasks.helper.log('Failed resolving dependency to jus-task, but the declaration has been found in your "package.json", maybe you forgot to "npm install" ?', tasks.helper.level.WARNING);
            }
          });
        }
      });
    }
  });
}
