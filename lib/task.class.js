const helper = require('./helper');
const util = require('util');

const Task = function(options) {
  extend(this, extend({
    "namespace":        null,
    "name":             undefined,
    "execute":          undefined,
    "description":      '',
    "shortDescription": undefined,
    "aliases":          [],
    "configure":        undefined,
  }, options || {}));
  this.configure();
};
Task.prototype = {
  get namespace()               { return this._namespace; },
  set namespace(v)              { check(v, 'namespace', false, 'id'); this._namespace = v; },
  get name()                    { return this._name; },
  set name(v)                   { check(v, 'name', true, 'id'); this._name = v; },
  get aliases()                 { return this._aliases; },
  set aliases(v)                { check(v, 'aliases', false, Array); this._aliases = [];(function(self){v.forEach(function(a){ self.addAlias(a); }); })(this); },
  "addAlias": function(alias)   { check(alias, 'alias', true, 'id'); this._aliases.push(alias); },
  "matchName": function(name)   { return name == this.fullName || this.aliases.indexOf(name) != -1; },
  get description()             { return this._description; },
  set description(v)            { check(v, 'description', false, 'string'); this._description = v; },
  get shortDescription()        { return this._shortDescription || (this.description ? this._description.substring(0, this._description.indexOf('\n')-1) : ''); },
  set shortDescription(v)       { check(v, 'shortDescription', false, 'one-lined string', true); this._shortDescription = v; },
  get execute()                 { return function(opts, args) { return this._execute(prepOpts(opts, this._options), prepArgs(args, this._arguments)); }; },
  set execute(v)                { check(v, 'execute', true, 'function'); this._execute = v; },
  get configure()               { return this._configure || function() {}; },
  set configure(v)              { check(v, 'configure', false, 'function'); this._configure = v; },
  get fullName()                { return (this.namespace ? (this._namespace + ':') : '') + this.name; },
  get arguments()               { return Object.keys(this._arguments || {}); },
  "getArgument": function(name) { return (this._arguments || {})[name]; },
  "addArgument": function(arg)  { if (!(arg instanceof Argument)) arg = new Argument(arg); if (this._previousArgMandatory === false && arg.mandatory) throw new Error('Argument "' + arg.name + '" cannot be mandatory, as a non mandatory argument has been previously added'); if (typeof this._arguments == 'undefined') this._arguments = {}; this._arguments[arg.name] = arg; this._previousArgMandatory = arg.mandatory; },
  get options()                 { return Object.keys(this._options || {}); },
  "getOption": function(name)   { for (var o in (this._options || {})) if (o == name || this._options[o].shortName == name) return this._options[o]; },
  "addOption": function(opt)    { if (!(opt instanceof Option)) opt = new Option(opt); if (typeof this._options == 'undefined') this._options = {}; this._options[opt.name] = opt; if (opt.shortName) for (var o in this._options) if (o != opt.name && o.shortName == opt.shortName) throw new Error('Duplicate short name "' + opt.shortName + '" with "' + opt.name + '" and "' + this._options[o].name + '"'); },
  "debug": function(message)    { console.log(helper.colorize('DEBUG', 'cyan'), message); },
  "error": function(message)    { console.log(helper.colorize('ERROR', 'red'), message); },
};

const Argument = function(options) {
  extend(this, extend({
    "name":        undefined,
    "mandatory":   false,
    "default":     undefined,
    "description": '',
  }, options || {}));
};
Argument.prototype = {
  get name()         { return this._name; },
  set name(v)        { check(v, 'name', true, 'id'); this._name = v; },
  get mandatory()    { return this._mandatory; },
  set mandatory(v)   { check(v || false, 'mandatory', true, 'boolean'); this._mandatory = v; },
  get default()      { return this._default; },
  set default(v)     { this._default = v; },
  get description()  { return this._description; },
  set description(v) { check(v, 'description', false, 'one-lined string'); this._description = v; },
};
Task.Argument = Argument;

const Option = function(options) {
  Argument.call(this, options);
  extend(this, extend({
    "shortName": null,
  }, options || {}));
};
util.inherits(Option, Argument);
Option.prototype = {
  get shortName()    { return this._shortName; },
  set shortName(v)   { check(v, 'shortName', false, 'id'); this._shortName = v; },
  get expectsValue() { return this.isMandatory || (this.defaultValue !== null && this.default !== false && typeof this.default != 'undefined'); },
};
Task.Option = Option;

function check(value, name, mandatory, type) {
  var error = null;
  if (value === null || typeof value == 'undefined') {
    if (mandatory) error = 'is mandatory';
  } else if (typeof type != 'undefined') {
    if (type == 'id') {
      if (typeof value != 'string' || !value.match(/^[a-z][a-z0-9\-_]*$/i)) error = 'must be a valid identifier';
    } else if (type == 'one-lined string') {
      if (typeof value != 'string' || value.indexOf('\n') != -1) error = 'must be a one-line string';
    } else if (typeof type == 'string') {
      if (typeof value != type) error = 'must be a valid ' + type;
    } else {
      if (!(value instanceof type)) error = 'must be a valid ' + type.name;
    }
  }
  if (error) throw new Error('Option "' + name + '" ' + error);
}

function extend(obj1, obj2) {
  Object.getOwnPropertyNames(obj2).forEach(function(k) {
    try {
      obj1[k] = obj2[k];
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error('Invalid parameter "' + k + '"');
      } else {
        throw err;
      }
    }
  });
  return obj1;
}

function prepOpts(params, options, type) {
  if (typeof type == 'undefined') type = 'option';
  var result = {};
  var optNames = [];
  if (options) {
    for (var optName in options) {
      var option = options[optName];
      optNames.push(option.name);
      var value = params ? params[option.name] : undefined;
      if (type == 'option') { // Check short name
        optNames.push(option.shortName);
        if (typeof value == 'undefined') {
          value = params[option.shortName];
        }
      }
      if (typeof value == 'undefined' || value === null) {
        if (option.mandatory) {
          throw new Error('Mandatory ' + type + ' "' + option.name + '" is undefined');
        }
        value = option.default;
      }
      if (typeof value != 'undefined') {
        result[option.name] = value;
      }
    }
  }
  if (params) {
    for (var param in params) {
      if (optNames.indexOf(param) == -1) {
        throw new Error('Unknown ' + type + ' "' + param + '"');
      }
    }
  }
  return result;
}

function prepArgs(params, args) {
  if (params instanceof Array) {
    var result = {};
    var mandatories = [];
    for (var arg in args) {
      if (args[arg].mandatory) mandatories.push(args[arg].name);
    }
    if (params.length < mandatories.length) {
      var missing = mandatories.slice(params.length);
      throw new Error('Missing ' + missing.length + ' argument' + (missing.length > 1 ? 's' : '') + ': ' + missing);
    }
    var i = 0;
    for (var arg in args) {
      var value = i<params.length ? params[i++] : args[arg].default;
      if (typeof value != 'undefined') {
        result[arg] = value;
      }
    }
    return result;
  } else {
    return prepOpts(params, args, 'argument');
  }
}

// Exports
module.exports = Task;
