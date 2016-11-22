'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = help;
exports.newHelpWrapper = newHelpWrapper;

var _schema = require('./schema');

var _cliui = require('cliui');

var _cliui2 = _interopRequireDefault(_cliui);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultFormat = {
  string: function string(v) {
    return v ? '[default: "' + v + '"]' : '';
  },
  number: function number(v) {
    return v ? '[default: ' + v + ']' : '';
  },
  boolean: function boolean(v) {
    return typeof v == 'boolean' ? '[default: ' + v + ']' : '';
  }
};

function stdFormat(_ref) {
  var _ref$type = _ref.type;
  var type = _ref$type === undefined ? 'any' : _ref$type;
  var v = _ref.default;
  var _ref$help = _ref.help;
  var help = _ref$help === undefined ? '' : _ref$help;
  var optional = _ref.optional;

  var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref2$wrapDefault = _ref2.wrapDefault;
  var wrapDefault = _ref2$wrapDefault === undefined ? function (_) {
    return _;
  } : _ref2$wrapDefault;
  var _ref2$wrapType = _ref2.wrapType;
  var wrapType = _ref2$wrapType === undefined ? function (_) {
    return _;
  } : _ref2$wrapType;

  if (type == 'string') {
    wrapDefault = function wrapDefault(d) {
      return '"' + d + '"';
    };
  }
  if (Array.isArray(type)) {
    type = type.join('|');
  }
  return [wrapType('<' + type + '>') + ' ', v ? '[default: ' + wrapDefault(v) + ']' : optional ? '[optional]' : '[required]', help.length ? '# ' + help : ''].join('\t');
}

function resolveProperties(_ref3) {
  var properties = _ref3.properties;
  var allOf = _ref3.allOf;

  return properties || Object.assign.apply(Object, [{}].concat(_toConsumableArray(allOf.map(resolveProperties))));
}

function formatProperties(_ref4) {
  var properties = _ref4.properties;
  var keys = _ref4.keys;
  var optional = _ref4.optional;

  return keys.map(function (p) {
    return '\n--' + p + ' ' + verboseFormatter(_extends({ optional: optional }, properties[p]), { property: p });
  }).join('');
}

var verboseFormat = {
  array: function array(_ref5, _ref6) {
    var _ref5$help = _ref5.help;
    var help = _ref5$help === undefined ? '' : _ref5$help;
    var defaultValue = _ref5.default;
    var items = _ref5.items;

    var details = _objectWithoutProperties(_ref5, ['help', 'default', 'items']);

    var nested = _ref6.nested;
    var _ref6$property = _ref6.property;
    var property = _ref6$property === undefined ? 'items' : _ref6$property;

    if (items.type == 'object') {
      return nest(verboseFormatter(items, { nested: true, wrapType: function wrapType(type) {
          return type + ',\n...' + property;
        } }), help);
    } else {
      return verboseFormatter(_extends({ help: help }, items), { nested: false, wrapType: function wrapType(type) {
          return '[ ' + type + ', ...' + property + ' ]';
        } });
    }
  },
  object: function object(_ref7, _ref8) {
    var _ref7$help = _ref7.help;
    var help = _ref7$help === undefined ? '' : _ref7$help;
    var defaultValue = _ref7.default;
    var _ref7$required = _ref7.required;
    var required = _ref7$required === undefined ? [] : _ref7$required;

    var details = _objectWithoutProperties(_ref7, ['help', 'default', 'required']);

    var nested = _ref8.nested;
    var _ref8$wrapType = _ref8.wrapType;
    var wrapType = _ref8$wrapType === undefined ? function (_) {
      return _;
    } : _ref8$wrapType;

    var properties = resolveProperties(details);
    var optional = Object.keys(properties).filter(function (p) {
      return !required.includes(p);
    });
    var formatted = [formatProperties({ properties: properties, keys: required }), optional.length ? formatProperties({ properties: properties, keys: optional, optional: true }) : ''].join('\n').trim().replace(/\n *\n/g, '\n');
    return wrapType(nested ? nest(formatted, help) : formatted);
  }
};

function indent(str) {
  return str.replace(/^(?=[^\n])/, '\n').replace(/\n/g, '\n  ').replace(/(?=[^\n *])$/, '\n');
}

function nest(str) {
  var help = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return '[\t\t' + (help.length ? '# ' + help : '') + indent(str) + '\n]';
}

function verboseFormatter(details) {
  var _ref9 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref9$nested = _ref9.nested;
  var nested = _ref9$nested === undefined ? true : _ref9$nested;
  var _ref9$wrapType = _ref9.wrapType;
  var wrapType = _ref9$wrapType === undefined ? function (_) {
    return _;
  } : _ref9$wrapType;

  var rest = _objectWithoutProperties(_ref9, ['nested', 'wrapType']);

  var configuration = _extends({ nested: nested, wrapType: wrapType }, rest);
  return verboseFormat[details.type] ? verboseFormat[details.type](details, configuration) : stdFormat(details, configuration);
}

function greater(val, val2) {
  return val < val2 ? val2 : val;
}

function getMaxWidths(rows) {
  var widths = rows.reduce(function (_ref10, row) {
    var flagInfo = _ref10.flagInfo;
    var required = _ref10.required;
    var help = _ref10.help;

    var _row$split = row.split('\t');

    var _row$split2 = _slicedToArray(_row$split, 3);

    var _row$split2$ = _row$split2[0];
    var f = _row$split2$ === undefined ? '' : _row$split2$;
    var _row$split2$2 = _row$split2[1];
    var r = _row$split2$2 === undefined ? '' : _row$split2$2;
    var _row$split2$3 = _row$split2[2];
    var h = _row$split2$3 === undefined ? '' : _row$split2$3;

    flagInfo = greater(flagInfo, f.length);
    required = greater(required, r.length);
    help = greater(help, h.length);
    return { flagInfo: flagInfo, required: required, help: help };
  }, { flagInfo: 0, required: 0, help: 0 });
  var desiredHelpWidth = widths.help;
  widths.help = process.stdout.columns - widths.required - widths.flagInfo - 8; // padding
  if (widths.help < 0 /*|| widths.help < desiredHelpWidth / 4*/) {
      return { flagInfo: 0, required: 0, help: 0 };
    }
  return widths;
}

function buildColumns(row, widths) {
  var _row$split3 = row.split('\t');

  var _row$split4 = _slicedToArray(_row$split3, 3);

  var flagInfo = _row$split4[0];
  var _row$split4$ = _row$split4[1];
  var required = _row$split4$ === undefined ? '' : _row$split4$;
  var _row$split4$2 = _row$split4[2];
  var help = _row$split4$2 === undefined ? '' : _row$split4$2;

  return [{
    text: flagInfo,
    width: widths.flagInfo + 4,
    padding: [0, 2, 0, 2 + flagInfo.search(/\S|$/)]
  }, {
    text: required,
    width: widths.required + 2,
    padding: [0, 2, 0, 0]
  }, {
    text: help,
    width: widths.help + 2,
    padding: [0, 2, 0, 0]
  }];
}

function formatHelp(str) {
  var ui = (0, _cliui2.default)({ width: process.stdout.columns });
  var rows = str.split('\n');
  var widths = getMaxWidths(rows);
  rows.map(function (row) {
    return buildColumns(row, widths);
  }).forEach(function (row) {
    return ui.div.apply(ui, _toConsumableArray(row));
  });
  return ui.toString();
}

function help(_ref11) {
  var _ref11$name = _ref11.name;
  var name = _ref11$name === undefined ? 'jargon' : _ref11$name;
  var description = _ref11.description;
  var schema = _ref11.schema;

  schema = (0, _schema.dereferenceSync)(schema);
  var topLevelDescription = description ? '\n' + description : schema.help ? '\n\n' + schema.help + '\n' : '';
  try {
    return '\nUsage: ' + name + ' ' + topLevelDescription + ' \nArguments:\n\n' + formatHelp(verboseFormatter(schema, { nested: false }));
  } catch (err) {
    console.error(err);
    var ui = (0, _cliui2.default)({ width: process.stdout.columns });
    ui.div({
      padding: [1, 2, 1, 2],
      text: _colors2.default.red.bold('Jargon Parser Encountered error while building help statement\n') + 'The given schema is probably too complex for the help generator. \n' + ('Please open an issue at ' + _colors2.default.blue.underline('https://github.com/polypacker/jargon-parser/issues') + ' ') + 'with your stacktrace and schema, so we can work on supporting it.' });
    return ui.toString();
  }
}

function newHelpWrapper(_ref12) {
  var _ref12$name = _ref12.name;
  var name = _ref12$name === undefined ? _path2.default.relative(process.cwd(), process.argv[1]) : _ref12$name;
  var _ref12$flag = _ref12.flag;
  var flag = _ref12$flag === undefined ? 'help' : _ref12$flag;
  var _ref12$catchErrors = _ref12.catchErrors;
  var catchErrors = _ref12$catchErrors === undefined ? true : _ref12$catchErrors;
  var schema = _ref12.schema;

  var rest = _objectWithoutProperties(_ref12, ['name', 'flag', 'catchErrors', 'schema']);

  var helpStatement = help(_extends({ name: name, schema: schema }, rest));
  function displayHelp() {
    console.info(helpStatement);
    process.exit();
  }
  function helpWrapper(func) {
    return function () {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var tokens = arguments.length <= 0 || arguments[0] === undefined ? process.argv.slice(2) : arguments[0];

      if (tokens.includes('--' + flag)) displayHelp();

      try {
        return func.apply(undefined, [tokens].concat(args));
      } catch (err) {
        if (catchErrors) {
          console.error(err.message);
          //console.error(err.stack)
          displayHelp();
        } else {
          throw err;
        }
      }
    };
  }
  return helpWrapper;
}