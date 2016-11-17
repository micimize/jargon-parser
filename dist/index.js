'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.default = undefined;

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _utils2 = require('./utils');

var _utils = _interopRequireWildcard(_utils2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _parser2.default;
exports.utils = _utils;