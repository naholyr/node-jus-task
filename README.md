JUS
===

`jus` [dʒʌs] is a project of a full stack framework for Node.JS.

This framework will bring CLI task management, generation capabilities, environment dependeng settings, fully-featured i18n, server based on express…

JUS Tasks
=========

`jus-task` is the Command Line Interface for `jus`.

Installation
------------

    npm install jus-task

CLI Usage
---------

`jus help`

    Usage
      jus [OPTIONS] [Task] [ARGUMENTS]
    
    Options:
      --help          Show this help and exit
      --version       Show version and exit
      --no-color      Disable ANSI color
    
    
    Available tasks:
      Call "jus list"

`jus list`

    Usage:
      just [OPTIONS] namespace:task [ARGUMENTS]
    
    task
      :help          Display help for a given task (help)
      :generate      Generate skeleton for new task (gen-task)
      :list          List available tasks (list)

Execute a task
--------------

`jus [OPTIONS] <namespace>:<task name> [ARGUMENTS]`

Create a new task
-----------------

Jus will search for tasks as any JS file in a "tasks" folder within:
* current folder
* jus-task installation folder
* any "node_modules" folder in one of those directories (recursively)

Any file in this folder will be loaded as a module, that's supposed to return an instance of `Task`.

Call `jus task:generate namespace task_name` to generate a new task `namespace:task_name`.

Example: `jus task:generate hello kitty` will generate `tasks/hello.kitty.js`.

    const tasks = require('jus-task');
    const helper = tasks.helper;
    const Task = tasks.Task;
    
    module.exports = new Task({
      "namespace":        'hello',
      "name":             'kitty',
      "aliases":          [],
      "description":      'Long description for your task\nthat can be multi-line',
      "shortDescription": 'Short description for your task',
      "configure":        function() {
        this.addOption({"name":'foo', "shortName":'f', "mandatory":false, "default":'bar'});
        this.addArgument({"name":'baz', "mandatory":false, "default":'some value'});
      },
      "execute":          function(opts, args) {
        helper.logSection('option', 'foo = ' + opts.foo);
        helper.logSection('argument', 'baz = ' + args.baz);
      }
    });

Call `jus help hello:kitty` to check usage of your freshly created task.

API
---

API is not fully documented yet, but generated tasks should bring a good base to see how it works :)

Check files into this folder's `tasks` subdirectory. These are the default tasks embedded with `jus-task`, and they could learn you a lot about how you can write tasks interacting with file-system for example.

**`jus-task module`**

`const tasks = require('jus-task')`

* `list()` → Hash, key being the namespace, value being the tasks list. Each list is a hash, key being the task's name, and value being the `Task` instance.
* `find(name)` → Instance of `Task`, name can be the full name (`hello:kitty`) or of its aliases. If task is not found, an `Error` is thrown.
* `Task` → Class of tasks.

**`tasks.Task`**

* `#constructor(options)` → Available options: "namespace", "name", "execute" (callback), "description", "shortDescription", "aliases", "configure" (callback called during initialization).
* `matchName(name)` → Returns true if given name matches task's full name or one of its aliases.
* `addOption(options)` → Adds a new option recognized by the task, this option will be available in the `opts` hash passed to `execute()`.
* `addArgument(options)` → Adds a new argument recognized by the task, this argument will be available in the `args` hash passed to `execute()`.
* `execute(opts, args)` → Executes the task.

**`tasks.Task.Option`**

TODO

**`tasks.Task.Argument`**

TODO

**`tasks.helper`**

TODO

Run a task programmatically
---------------------------

Example equivalent to `jus help list`:

    const tasks = require('jus-task')
    tasks.find('help').execute({}, {'task': 'list'})
