var style = {
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

function getOptionHelp(long, longMaxLength, short, description, defaultValue) {
  return ''
    + colorize(formatLength(long || '', longMaxLength + 2), 'green', style.BOLD)
    + colorize(formatLength(short || '', 4), 'green', style.BOLD)
    + description
    + (defaultValue ? (' ' + colorize('(' + defaultValue + ')', 'yellow')) : '');
}

function getOptionsHelp(options) {
  var longMaxLength = 0;
  options.forEach(function(option) {
    if (option[0].length > longMaxLength) longMaxLength = option[0].length;
  });
  var help = '';
  options.forEach(function(option) {
    help += '  ' + getOptionHelp(option[0], longMaxLength, option[1], option[2], option[3]) + '\n';
  });
  return help;
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

// Exports
module.exports = {
  "noColor": false,
  "style": style,
  "colorize": colorize,
  "log": log,
  "logSection": logSection,
  "logError": logError,
  "formatLength": formatLength,
  "getOptionHelp": getOptionHelp,
  "getOptionsHelp": getOptionsHelp,
};
