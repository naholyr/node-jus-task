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

Why would I use JUS Task ?
==========================

* It eases the development of CLI tools: just run `jus gen-task my-namespace my-task`, then follow the steps :)
* It has a souple and robust understanding of the CLI options. I don't like to reinvent the wheel, but I wanted a real parser for options, and all the tested ones (parseopt, nopt, getopt) didn't do the trick. Your users will have a full support of the usual ways to provide values for short/long options:
  * --foo=value
  * --foo value
  * -fvalue
  * -f value
* It provides automatic support for some useful common options you wouldn't want to reimplement each time you create such a script :
  * --debug to enable debug mode (check helper.debugMode in your task)
  * --log-level to change debug mode (then helper.log() will only display the proper messages)
  * --help will display full usage of your task + descriptions & co (if you provided some)
* It abstracts options parsing: just declare your options/arguments, name them, declare alias or whatever, you'll always receive the same expected hashes. Positional arguments become named arguments on your side, and that is cool :)

All these are already good reasons to use it in your project now.

This tool is built to be included in my future framework `jus`, and will be the default way to provide maintenance scripts and so on (like managing server, enabling features, generating modules…).
