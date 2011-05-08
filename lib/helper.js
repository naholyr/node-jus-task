const fs = require('fs');
const path = require('path');
const finder = require('finder');

const style = {
  "NORMAL":    0,
  "BOLD":      1,
  "UNDERLINE": 4
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

function log(message, length) {
  console.log(formatLength(message, length || 80));
}

function logSection(section, message, length) {
  console.log(
    colorize(formatLength(section, 10), 'green', style.BOLD) 
    + ' ' 
    + formatLength(message, (length || 80) - 11));
}

function logError(error) {
  console.error(colorize('\n  ' + (error.message || error) + '\n', 'white', style.NORMAL, 'red'));
}

function exists(file) {
  try {
    fs.statSync(file);
    return true;
  } catch (err) {
    return false;
  }
}

function chmod(file, mode) {
  logSection('chmod', file + ' ' + mode.toString(8));
  fs.chmodSync(file, mode);
}

function mkdirs(dir) {
  var create = [];
  while (!exists(dir)) {
    if (dir == '.') break;
    create.unshift(dir);
    dir = path.dirname(dir);
  }
  create.forEach(function(d) {
    fs.mkdirSync(d, 0755);
  });
}

function mkdir(dir) {
  if (!exists(dir)) {
    logSection('dir+', dir);
    mkdirs(dir);
  }
}

function rmdir(dir) {
  if (exists(dir)) {
    logSection('dir-', dir);
    fs.rmdirSync(dir);
  }
}

function touch(file) {
  mkdir(path.dirname(file));
  if (!exists(file)) {
    logSection('file+', file);
    fs.writeFileSync(file, '');
  }
}

function unlink(file) {
  if (exists(file)) {
    logSection('file-', file);
    fs.unlinkSync(file);
  }
}

function token(file, replace, content) {
  touch(file);
  logSection('tokens', file);
  if (typeof content == 'undefined') content = fs.readFileSync(file);
  for (var token in replace) {
    var value = replace[token];
    while (content.indexOf(token) != -1) content = content.replace(token, value);
  }
  fs.writeFileSync(file, content);
}

// Exports
module.exports = {
  "noColor": false,
  "debugMode": false,

  "style": style,
  "colorize": colorize,
  "log": log,
  "logSection": logSection,
  "logError": logError,
  "formatLength": formatLength,
  "getOptionsHelp": getOptionsHelp,
  "formatTitle": formatTitle,

  "exists": exists,
  "mkdir": mkdir,
  "touch": touch,
  "unlink": unlink,
  "token": token,

  "Finder": finder.Finder,
};
