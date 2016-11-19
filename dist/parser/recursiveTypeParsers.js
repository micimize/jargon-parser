'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.array = array;
exports.object = object;

var _primitiveTypeParsers = require('./primitiveTypeParsers');

var primitives = _interopRequireWildcard(_primitiveTypeParsers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var escapeCommand = ',';

function isKey(token) {
    return (/^-.+/.test(token)
    );
}

function array(_ref) {
    var schemaResolver = _ref.schemaResolver;

    var _ref$tokens = _toArray(_ref.tokens);

    var token = _ref$tokens[0];

    var tokens = _ref$tokens.slice(1);

    var value = [];
    while (token) {
        if (token == escapeCommand) {
            break;
        }
        if (isKey(token)) {
            var _object = object({ schemaResolver: schemaResolver, tokens: [token].concat(_toConsumableArray(tokens)) });

            var subValue = _object.value;

            var _object$remainder = _toArray(_object.remainder);

            var newToken = _object$remainder[0];

            var newTokens = _object$remainder.slice(1);

            value.push(subValue);
            token = newToken;
            tokens = newTokens;
        } else {
            value.push(token);
            var _tokens = tokens;

            var _tokens2 = _toArray(_tokens);

            var _newToken = _tokens2[0];

            var _newTokens = _tokens2.slice(1);

            token = _newToken;
            tokens = _newTokens;
        }
    }
    return { value: value, remainder: tokens };
}

function object(_ref2) {
    var schemaResolver = _ref2.schemaResolver;

    var _ref2$tokens = _toArray(_ref2.tokens);

    var token = _ref2$tokens[0];

    var tokens = _ref2$tokens.slice(1);

    var value = {};
    while (typeof token == 'string') {
        if (token == escapeCommand) {
            break;
        }

        var _schemaResolver = schemaResolver({ token: token });

        var key = _schemaResolver.key;
        var _schemaResolver$defau = _schemaResolver.defaultValue;
        var defaultValue = _schemaResolver$defau === undefined ? undefined : _schemaResolver$defau;
        var subParser = _schemaResolver.parser;
        var subSchemaResolver = _schemaResolver.schemaResolver;

        var _subParser = subParser({ schemaResolver: subSchemaResolver, tokens: tokens });

        var _subParser$value = _subParser.value;
        var subValue = _subParser$value === undefined ? defaultValue : _subParser$value;

        var _subParser$remainder = _toArray(_subParser.remainder);

        var newToken = _subParser$remainder[0];

        var newTokens = _subParser$remainder.slice(1);

        token = newToken;
        tokens = newTokens;
        value[key] = subValue;
    }
    return { value: value, remainder: tokens };
}