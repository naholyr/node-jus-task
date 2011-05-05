var style = {
  "NORMAL":    0,
  "BOLD":      1,
  "UNDERLINE": 4
};

var colors = ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white'];

function colorize(message, textColor, textStyle, backgroundColor) {
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


// Exports
module.exports = {
  "style": style,
  "colorize": colorize
};
