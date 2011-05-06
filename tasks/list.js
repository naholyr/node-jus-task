const tasks = require('../index');

module.exports = new tasks.Task({
  "namespace": "task",
  "name": "list",
  "aliases": ["list"],
  "execute": function(opts, args) {
    console.log(tasks.helper.formatTitle('Usage:'));
    console.log('  just [OPTIONS] namespace:task [ARGUMENTS]\n');
    var sections = {};
    var list = tasks.list();
    for (var ns in list) {
      if (args.namespace && ns != args.namespace) continue;
      var section = [];
      for (var key in list[ns]) {
        var task = list[ns][key];
        section.push([':' + task.name, null, task.shortDescription || 'No description available', task.aliases]);
      }
      sections[ns] = section;
    }
    if (args.namespace && !sections[args.namespace]) {
      tasks.helper.logError('No task available in namespace "' + args.namespace + '"');
    } else {
      console.log(tasks.helper.getOptionsHelp(sections));
    }
  },
  "configure": function() {
    this.addArgument({"name":'namespace', "mandatory":false, "description":'Limit list to given namespace'});
  },
  "shortDescription": 'List available tasks',
  "description": 'List available tasks\n\n  jus list\n\nwill list all available tasks for all namespaces, while\n\n  jus list ns\n\nwill list all tasks "ns:…"',
});
