const tasks = require('..');

module.exports = new (tasks.Task)({
  "namespace": "task",
  "name": "help",
  "aliases": ["help"],
  "execute": function(opts, args) {
    showHelp(tasks.find(args.task));
  },
  "configure": function() {
    this.addArgument({"name":'task', "mandatory":false, "default":this.fullName, "description":'Task name'});
  },
  "shortDescription": 'Display help for a given task',
  "description": 'The help task will display help for a given task:\narguments, options, mandatories, etc…',
});

function showHelp(task) {
  var argsForHelp = [];
  task.arguments.forEach(function(arg) {
    arg = task.getArgument(arg);
    argsForHelp.push([arg.name, null, arg.description || 'No description available', arg.default ? ('default: ' + arg.default) : '', arg.mandatory]);
  });
  var optsForHelp = [];
  task.options.forEach(function(opt) {
    opt = task.getOption(opt);
    var long = opt.name ? ('--' + opt.name) : null;
    var short = opt.shortName ? ('-' + opt.shortName) : null;
    optsForHelp.push([long, short, opt.description || 'No description available', opt.default ? ('default: ' + opt.default) : '', opt.mandatory]);
  });
  var help = '';
  if (task.shortDescription) help += task.shortDescription + '\n\n';
  help += tasks.helper.formatTitle('Usage') + '\n'
    + '  jus ' + task.fullName + ' ' + getOptionsUsage(task) + '\n\n'
    + tasks.helper.getOptionsHelp({
        "Arguments:": argsForHelp,
        "Options:":   optsForHelp,
      })
  if (task.description) {
    help += tasks.helper.formatTitle('Description') + '\n'
      + '  ' + task.description.split('\n').join('\n  ') + '\n';
  }
  console.log(help);
}

function getOptionsUsage(task) {
  var usage = '';
  task.options.forEach(function(opt) {
    var option = task.getOption(opt);
    if (!option.mandatory) usage += '[';
    usage += '--' + option.name;
    if (option.expectsValue) {
      if (!option.mandatory) usage += '[';
      usage += '=…';
      if (!option.mandatory) usage += ']';
    }
    if (!option.mandatory) usage += '] ';
  });
  task.arguments.forEach(function(arg) {
    var argument = task.getArgument(arg);
    if (!argument.mandatory) usage += '[';
    usage += argument.name;
    if (!argument.mandatory) usage += '] ';
  });
  return usage.replace(/^\s*(.*?)\s*$/, '$1');
}
