const fs = require('fs');
const path = require('path');
const finder = require('finder');

const style = {
  "NORMAL":    0,
  "BOLD":      1,
  "UNDERLINE": 4
};

const level = {
  "DEBUG":   0,
  "INFO":    1,
  "WARNING": 2,
  "ERROR":   3
};

var colors = ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white'];

function colorize(message, textColor, textStyle, backgroundColor) {
  if (module.exports.noColor) return message;
  if (typeof textColor == 'undefined') textColor = 'white';
  if (typeof style == 'undefined') style = style.NORMAL;
  var colorInfo = '';
  var addColorInfo = function(info) {
    if (colorInfo != '') colorInfo += ';';
    colorInfo += info;
  }
  for (var k in style) {
    if ((style[k] & textStyle) == style[k]) {
      addColorInfo(style[k]);
    }
  }
  var getColorNum = function(color) {
    var num = colors.indexOf(color);
    if (num == -1) throw new Error('Unknown color "' + color + '"');
    return num;
  }
  addColorInfo('3' + getColorNum(textColor));
  if (typeof backgroundColor != 'undefined') {
    addColorInfo('4' + getColorNum(backgroundColor));
  }
  return '\x1b[' + colorInfo + 'm' + message + '\x1b[0m';
}

function formatLength(string, length) {
  if (string.length > length) {
    string = string.substring(0, length/2-1) + '…' + string.substring(length/2+1);
  } else {
    while (string.length < length) string += ' ';
  }
  return string;
}

function getOptionHelp(long, longMaxLength, short, description, defaultValue, mandatory) {
  return ''
    + colorize(formatLength(long || '', longMaxLength + 2), 'green', style.BOLD)
    + colorize(formatLength(short || '', 4), 'green', style.BOLD)
    + description
    + (defaultValue ? (' ' + colorize('(' + defaultValue + ')', 'yellow')) : '')
    + (mandatory ? colorize(' (mandatory)', 'red') : '');
}

function getOptionsHelp(options) {
  var longMaxLength = 0;
  if (typeof options == 'object') {
    for (var title in options) {
      options[title].forEach(function(option) {
        if (option[0].length > longMaxLength) longMaxLength = option[0].length;
      });
    }
  } else {
    options.forEach(function(option) {
      if (option[0].length > longMaxLength) longMaxLength = option[0].length;
    });
  }
  var help = '';
  if (typeof options == 'object') {
    for (var title in options) {
      help += formatTitle(title) + '\n';
      options[title].forEach(function(option) {
        help += '  ' + getOptionHelp(option[0], longMaxLength, option[1], option[2], option[3], option[4] || false) + '\n';
      });
      help += '\n';
    }
  } else {
    options.forEach(function(option) {
      help += '  ' + getOptionHelp(option[0], longMaxLength, option[1], option[2], option[3], option[4] || false) + '\n';
    });
  }
  return help;
}

function formatTitle(title) {
  return colorize(title, 'yellow');
}

function getLogLevelPrefix(logLevel) {
  switch (logLevel) {
    case level.DEBUG:   return 'DEBUG';
    case level.INFO:    return 'INFO';
    case level.WARNING: return 'WARN';
    case level.ERROR:   return 'ERROR';
  }
}

function getLogLevelStyle(logLevel) {
  switch (logLevel) {
    case level.DEBUG:   return ['cyan', style.NORMAL, undefined];
    case level.INFO:    return ['white', style.NORMAL, undefined];
    case level.WARNING: return ['yellow', style.BOLD, undefined];
    case level.ERROR:   return ['white', style.BOLD, 'red'];
  }
}

function formatMessage(message, logLevel, length, withPrefix, isBlock) {
  if (typeof logLevel == 'undefined') logLevel = level.INFO;
  if (typeof length == 'undefined') length = exports.defaultLength;
  if (logLevel < exports.logLevel) return false;
  var prefix = getLogLevelPrefix(logLevel);
  if (prefix && withPrefix) {
    message = '['+formatLength(prefix, 5)+']    ' + message;
  }
  if (isBlock) {
    message = message.replace(new RegExp('(.{' + (length-2) + '})', 'g'), '$1\n');
    message = '\n  ' + message.split('\n').join('\n  ') + '\n';
  } else {
    message = formatLength(message, length);
  }
  if (prefix) {
    var style = getLogLevelStyle(logLevel);
    return colorize(message, style[0], style[1], style[2]);
  } else {
    return message;
  }
}

function log(message, logLevel, length) {
  message = formatMessage(message, logLevel, length, true, false);
  if (!message) return false;
  console.log(message);
  return true;
}

function logBlock(message, logLevel, length) {
  message = formatMessage(message, logLevel, length, false, true);
  if (!message) return false;
  console.log(message);
  return true;
}

function logSection(section, message, logLevel, length) {
  message = formatMessage(message, logLevel, length - 11, false, false);
  if (!message) return false;
  console.log(colorize(formatLength(section, 10), 'green', style.BOLD) + ' ' + message);
  return true;
}

function logError(error, logLevel) {
  logBlock(error.message || error, level.ERROR);
}

function exists(file, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    return path.existsSync(file);
  } else {
    // Async
    path.exists(file, function(found) {
      callback(undefined, found);
    });
  }
}

function chmod(file, mode, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    fs.chmodSync(file, mode);
    logSection('chmod', file + ' ' + mode.toString(8));
  } else {
    // Async
    fs.chmod(file, mode, function(err) {
      if (!err) logSection('chmod', file + ' ' + mode.toString(8));
      callback(err);
    });
  }
}

function mkdir(dir, mode, callback) {
  if (typeof mode == 'function' && typeof callback == 'undefined') { callback = mode; mode = undefined; }
  if (typeof mode == 'undefined') mode = 0755;
  if (typeof callback == 'undefined') {
    // Sync
    if (exists(dir)) return false;
    var create = [];
    while (!exists(dir)) {
      if (dir == '.') break;
      create.unshift(dir);
      dir = path.dirname(dir);
    }
    create.forEach(function(d) {
      fs.mkdirSync(d, mode);
      logSection('dir+', d);
    });
    return true;
  } else {
    // Async
    checkParentExists(dir, []);
    function checkParentExists(d, create) {
      exists(d, function(err, found) {
        if (d != '.' && !found) {
          create.unshift(d);
          checkParentExists(path.dirname(d), create);
        } else {
          createDirs(create);
        }
      });
    }
    function createDirs(create) {
      function doCreateDir() {
        if (create.length == 0) {
          callback();
        } else {
          var d = create.shift();
          fs.mkdir(d, mode, function(err) {
            if (err) callback(err);
            else {
              logSection('dir+', d);
              doCreateDir();
            }
          });
        }
      }
      doCreateDir();
    }
  }
}

function rmdir(dir, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    if (exists(dir)) {
      fs.rmdirSync(dir);
      logSection('dir-', dir);
    }
  } else {
    // Async
    exists(dir, function(err, v) {
      if (v) {
        fs.rmdir(dir, function(err) {
          if (!err) logSection('dir-', dir);
          callback(err);
        });
      }
    });
  }
}

function touch(file, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    if (!exists(file)) {
      mkdir(path.dirname(file));
      fs.writeFileSync(file, '');
      logSection('file+', file);
    }
  } else {
    // Async
    exists(file, function(err, v) {
      if (v || err) callback(err);
      else {
        mkdir(path.dirname(file), function(err) {
          if (err) callback(err);
          else fs.writeFile(file, '', function(err) {
            if (!err) logSection('file+', file);
            callback(err);
          });
        });
      }
    });
  }
}

function unlink(file, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    if (exists(file)) {
      fs.unlinkSync(file);
      logSection('file-', file);
    }
  } else {
    // Async
    exists(file, function(err, v) {
      if (!v || err) callback(err);
      else fs.unlink(file, function(err) {
        if (!err) logSection('file-', file);
        callback(err);
      });
    });
  }
}

function read(file, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    var content = fs.readFileSync(file);
    logSection('read', file);
    return content;
  } else {
    // Async
    fs.readFile(file, function(err, content) {
      if (!err) logSection('read', file);
      callback(err, content);
    });
  }
}

function write(file, content, callback) {
  if (typeof callback == 'undefined') {
    // Sync
    touch(file);
    fs.writeFileSync(file, content);
    logSection('write', file);
  } else {
    // Async
    touch(file, function(err) {
      if (err) callback(err);
      else {
        fs.writeFile(file, content, function(err) {
          if (!err) logSection('write', file);
          callback(err);
        });
      }
    });
  }
}

function token(file, replace, content, callback) {
  function replaceTokens() {
    for (var token in replace) {
      var value = replace[token];
      while (content.indexOf(token) != -1) content = content.replace(token, value);
    }  
  }
  if (typeof callback == 'undefined') {
    // Sync
    if (typeof content == 'undefined') {
      if (!exists(file)) throw new Error('Try to replace content in-file, but file does not exist');
      content = fs.readFileSync(file);
    }
    replaceTokens();
    fs.writeFileSync(file, content);
    logSection('tokens', file);
  } else {
    // Async
    if (typeof content == 'undefined') exists(file, function(err, found) {
      if (!found) throw new Error('Try to replace content in-file, but file does not exist');
      read(file, function(err, c) { content = c; setFileContent(); });
    })
    else setFileContent();
    function setFileContent() {
      replaceTokens();
      write(file, content, function(err) {
        if (err) callback(err);
        else {
          logSection('tokens', file);
          callback();
        }
      });
    }
  }
}

// Exports
module.exports = {
  "noColor": false,
  "debugMode": false,
  "logLevel": level.INFO,
  "defaultLength": 80,

  "style": style,
  "level": level,
  "colorize": colorize,
  "log": log,
  "logSection": logSection,
  "logError": logError,
  "formatLength": formatLength,
  "getOptionsHelp": getOptionsHelp,
  "formatTitle": formatTitle,

  "exists": exists,
  "mkdir": mkdir,
  "rmdir": rmdir,
  "touch": touch,
  "unlink": unlink,
  "token": token,
  "read": read,
  "write": write,

  "Finder": finder.Finder,
};
