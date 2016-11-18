'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = parser;

var _subarg = require('subarg');

var _subarg2 = _interopRequireDefault(_subarg);

var _schema = require('./schema');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
 * essentially the only difference between subarg's result and jargon's result is that
 * arrays and dictionaries are mutually exclusive in json so we reduce all the '_' keys
 */
function normalizeSubargs(_ref) {
  var list = _ref['_'];

  var obj = _objectWithoutProperties(_ref, ['_']);

  var normalize = function normalize(token) {
    return (typeof token === 'undefined' ? 'undefined' : _typeof(token)) == 'object' ? normalizeSubargs(token) : token;
  };

  if (list.length && Object.keys(obj).length) {
    console.log('\n      list: ' + list + '\n      obj: ' + obj + '\n    ');
    throw TypeError("arrays and objects cannot coexist under the same key");
  }

  if (list.length) {
    return list.map(normalize);
  } else {
    return Object.keys(obj).reduce(function (o, key) {
      return Object.assign(o, _defineProperty({}, key, normalize(obj[key])));
    }, {});
  }
}

function parser(_ref2) {
  var schema = _ref2.schema;

  var casterArgs = _objectWithoutProperties(_ref2, ['schema']);

  var castToSchema = (0, _schema.casterFactory)(_extends({ schema: schema }, casterArgs));
  return function () {
    var tokens = arguments.length <= 0 || arguments[0] === undefined ? process.argv.slice(2) : arguments[0];
    return (0, _utils.thread)(tokens, [_subarg2.default, normalizeSubargs, castToSchema]);
  };
}