'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = help;
exports.newHelpWrapper = newHelpWrapper;

var _schema = require('./schema');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var defaultFormat = {
  string: function string(v) {
    return v ? '[default: "' + v + '"], ' : '';
  },
  number: function number(v) {
    return v ? '[default: ' + v + '], ' : '';
  },
  boolean: function boolean(v) {
    return typeof v == 'boolean' ? '[default: ' + v + '], ' : '';
  }
};

var inlineFormat = {
  string: function string(_ref) {
    var help = _ref.help;
    var defaultValue = _ref.default;

    var details = _objectWithoutProperties(_ref, ['help', 'default']);

    return '<string> ' + defaultFormat.string(defaultValue) + help;
  },
  number: function number(_ref2) {
    var help = _ref2.help;
    var defaultValue = _ref2.default;

    var details = _objectWithoutProperties(_ref2, ['help', 'default']);

    return '<number> ' + defaultFormat.number(defaultValue) + help;
  },
  boolean: function boolean(_ref3) {
    var help = _ref3.help;
    var defaultValue = _ref3.default;

    var details = _objectWithoutProperties(_ref3, ['help', 'default']);

    return '' + defaultFormat.boolean(defaultValue) + help;
  },


  // TODO default formatter for array and obj
  object: function object(_ref4) {
    var help = _ref4.help;
    var defaultValue = _ref4.default;
    var properties = _ref4.properties;

    var details = _objectWithoutProperties(_ref4, ['help', 'default', 'properties']);

    return '[ <properties> ] ' + help;
  },
  array: function array(_ref5) {
    var help = _ref5.help;
    var defaultValue = _ref5.default;

    var details = _objectWithoutProperties(_ref5, ['help', 'default']);

    return '[ <items>... ] ' + help;
  }
};

function inlineFormatter(_ref6) {
  var type = _ref6.type;

  var details = _objectWithoutProperties(_ref6, ['type']);

  return inlineFormat[type](details);
}

var verboseFormat = _extends({}, inlineFormat, {
  array: function array(_ref7) {
    var help = _ref7.help;
    var defaultValue = _ref7.default;
    var items = _ref7.items;

    var details = _objectWithoutProperties(_ref7, ['help', 'default', 'items']);

    return '[\n      ' + verboseFormat(items) + ', ...\n    ]';
  },
  object: function object(_ref8) {
    var help = _ref8.help;
    var defaultValue = _ref8.default;
    var properties = _ref8.properties;
    var _ref8$required = _ref8.required;
    var required = _ref8$required === undefined ? [] : _ref8$required;

    var details = _objectWithoutProperties(_ref8, ['help', 'default', 'properties', 'required']);

    var optional = Object.keys(properties).filter(function (p) {
      return !required.includes(p);
    });
    var optionalHelp = optional.length ? '\n    optional: ' + optional.map(function (p) {
      return '\n    --' + p + ' ' + inlineFormatter(properties[p]);
    }) : '';

    return '\n  [ ' + required.map(function (p) {
      return '\n    --' + p + ' ' + inlineFormatter(properties[p]);
    }) + '\n    ' + optionalHelp + '\n  ]';
  }
});

function help(_ref9) {
  var _ref9$name = _ref9.name;
  var name = _ref9$name === undefined ? 'jargon' : _ref9$name;
  var schema = _ref9.schema;

  var _dereferenceSync = (0, _schema.dereferenceSync)(schema);

  var type = _dereferenceSync.type;

  var dereferencedSchema = _objectWithoutProperties(_dereferenceSync, ['type']);

  return name + ' ' + verboseFormat[type](dereferencedSchema);
}

function newHelpWrapper(_ref10) {
  var _ref10$name = _ref10.name;
  var name = _ref10$name === undefined ? 'jargon' : _ref10$name;
  var _ref10$flag = _ref10.flag;
  var flag = _ref10$flag === undefined ? 'help' : _ref10$flag;
  var _ref10$catchErrors = _ref10.catchErrors;
  var catchErrors = _ref10$catchErrors === undefined ? true : _ref10$catchErrors;
  var schema = _ref10.schema;

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