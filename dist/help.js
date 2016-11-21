'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = help;
exports.newHelpWrapper = newHelpWrapper;

var _schema = require('./schema');

var _cliui = require('cliui');

var _cliui2 = _interopRequireDefault(_cliui);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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
  var v = _ref.default;
  var _ref$help = _ref.help;
  var help = _ref$help === undefined ? '' : _ref$help;
  var optional = _ref.optional;

  var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var type = _ref2.type;
  var _ref2$wrapDefault = _ref2.wrapDefault;
  var wrapDefault = _ref2$wrapDefault === undefined ? function (_) {
    return _;
  } : _ref2$wrapDefault;

  return [type ? '<' + type + '> ' : '', v ? '[default: ' + wrapDefault(v) + ']' : optional ? '[optional]' : '[required]', help.length ? '# ' + help : ''].join('\t');
}

var inlineFormat = {
  string: function string(details) {
    return stdFormat(details, { wrapDefault: function wrapDefault(d) {
        return '"' + d + '"';
      }, type: 'string' });
  },
  number: function number(details) {
    return stdFormat(details, { type: 'number' });
  },

  boolean: stdFormat,

  // TODO default formatter for array and obj
  object: function object(_ref3) {
    var _ref3$help = _ref3.help;
    var help = _ref3$help === undefined ? '' : _ref3$help;
    var defaultValue = _ref3.default;
    var properties = _ref3.properties;

    var details = _objectWithoutProperties(_ref3, ['help', 'default', 'properties']);

    return '[ <properties> ] ' + help;
  },
  array: function array(_ref4) {
    var _ref4$help = _ref4.help;
    var help = _ref4$help === undefined ? '' : _ref4$help;
    var defaultValue = _ref4.default;

    var details = _objectWithoutProperties(_ref4, ['help', 'default']);

    return '[ <item>... ] ' + help;
  }
};

function inlineFormatter(_ref5) {
  var type = _ref5.type;

  var details = _objectWithoutProperties(_ref5, ['type']);

  return inlineFormat[type](details);
}

function resolveProperties(_ref6) {
  var properties = _ref6.properties;
  var allOf = _ref6.allOf;

  return properties || Object.assign.apply(Object, [{}].concat(_toConsumableArray(allOf.map(resolveProperties))));
}

function formatProperties(_ref7) {
  var properties = _ref7.properties;
  var keys = _ref7.keys;
  var optional = _ref7.optional;

  return keys.map(function (p) {
    return '\n--' + p + ' ' + verboseFormatter(_extends({ optional: optional }, properties[p]));
  }).join('');
}

var verboseFormat = _extends({}, inlineFormat, {
  array: function array(_ref8) {
    var _ref8$help = _ref8.help;
    var help = _ref8$help === undefined ? '' : _ref8$help;
    var defaultValue = _ref8.default;
    var items = _ref8.items;

    var details = _objectWithoutProperties(_ref8, ['help', 'default', 'items']);

    return verboseFormatter(items) + ', ...items';
  },
  object: function object(_ref9) {
    var _ref9$help = _ref9.help;
    var help = _ref9$help === undefined ? '' : _ref9$help;
    var defaultValue = _ref9.default;
    var _ref9$required = _ref9.required;
    var required = _ref9$required === undefined ? [] : _ref9$required;

    var details = _objectWithoutProperties(_ref9, ['help', 'default', 'required']);

    var properties = resolveProperties(details);
    var optional = Object.keys(properties).filter(function (p) {
      return !required.includes(p);
    });
    return [help.length ? '# ' + help : '', formatProperties({ properties: properties, keys: required }), optional.length ? formatProperties({ properties: properties, keys: optional, optional: true }) : ''].join('\n').trim().replace(/\n *\n/g, '\n');
  }
});

function indent(str) {
  return str.replace(/^(?=[^\n])/, '\n').replace(/\n/g, '\n  ').replace(/(?=[^\n *])$/, '\n');
}

function nest(type, str) {
  if (['object', 'array'].includes(type)) {
    return '[' + indent(str) + '\n]';
  }
  return str;
}

function verboseFormatter(_ref10) {
  var type = _ref10.type;

  var details = _objectWithoutProperties(_ref10, ['type']);

  var nested = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  if (nested) return nest(type, verboseFormat[type](details));
  return verboseFormat[type](details);
}

function help(_ref11) {
  var _ref11$name = _ref11.name;
  var name = _ref11$name === undefined ? 'jargon' : _ref11$name;
  var schema = _ref11.schema;

  var ui = (0, _cliui2.default)();
  ui.div('Usage: ' + name + ' ' + indent(verboseFormatter((0, _schema.dereferenceSync)(schema), false)));
  return ui.toString();
}

function newHelpWrapper(_ref12) {
  var _ref12$name = _ref12.name;
  var name = _ref12$name === undefined ? 'jargon' : _ref12$name;
  var _ref12$flag = _ref12.flag;
  var flag = _ref12$flag === undefined ? 'help' : _ref12$flag;
  var _ref12$catchErrors = _ref12.catchErrors;
  var catchErrors = _ref12$catchErrors === undefined ? true : _ref12$catchErrors;
  var schema = _ref12.schema;

  var helpStatement = help({ name: name, schema: schema });
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
        console.log('caught');
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