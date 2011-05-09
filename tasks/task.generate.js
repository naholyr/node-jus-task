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
    tasks.helper.token(file, {
      "{{NAME}}":      args.name,
      "{{NAMESPACE}}": args.namespace,
      "{{ALIASES}}":   aliases,
    }, TEMPLATE);
    checkJusTaskDependency();
  }
});

function checkJusTaskDependency() {
  if (!path.existsSync('node_modules/jus-task')) {
    tasks.helper.log('Dependency "jus-task" not found in your project, checking "package.json"…', tasks.helper.level.WARNING);
    if (!path.existsSync('package.json')) {
      tasks.helper.log('No "package.json" found: You may create one and add "jus-task" as a dependency, or run "npm install jus-task"', tasks.helper.level.WARNING);
    } else {
      var packageJson = JSON.parse(fs.readFileSync('package.json'));
      if (typeof packageJson.dependencies['jus-task'] == 'undefined') {
        tasks.helper.log('"package.json" found. You may now add "jus-task" as a dependency and run "npm install"', tasks.helper.level.WARNING);
      } else {
        tasks.helper.log('"package.json" found, and properly configured dependency to "jus-task". Maybe you forgot to run "npm install" ?', tasks.helper.level.WARNING);
      }
    }
  }
}
