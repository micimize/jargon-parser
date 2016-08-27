'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = parser;

var _primitiveTypeParsers = require('./primitiveTypeParsers');

var primitives = _interopRequireWildcard(_primitiveTypeParsers);

var _recursiveTypeParsers = require('./recursiveTypeParsers');

var recursives = _interopRequireWildcard(_recursiveTypeParsers);

var _schemaResolver = require('../schemaResolver');

var _schemaResolver2 = _interopRequireDefault(_schemaResolver);

var _fs = require('fs');

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var ajv = new _ajv2.default();

function parse(_ref) {
    var schema = _ref.schema;

    var _ref$tokens = _toArray(_ref.tokens);

    var token = _ref$tokens[0];

    var tokens = _ref$tokens.slice(1);

    var validate = ajv.compile(schema);

    var resolverFromSchema = (0, _schemaResolver2.default)({ parsers: _extends({}, primitives, recursives) });

    var _resolverFromSchema = resolverFromSchema({ schema: schema });

    var parser = _resolverFromSchema.parser;
    var schemaResolver = _resolverFromSchema.schemaResolver;

    var _parser = parser({ schemaResolver: schemaResolver, tokens: tokens });

    var options = _parser.value;
    var unknown = _parser.remainder;


    if (!validate(options)) {
        console.log(validate.errors);
    }

    return { options: options, unknown: unknown };
}

function parser(_ref2) {
    var schema = _ref2.schema;
    var _ref2$encoding = _ref2.encoding;
    var encoding = _ref2$encoding === undefined ? 'utf-8' : _ref2$encoding;

    if (typeof schema == 'string') {
        schema = JSON.parse((0, _fs.readFileSync)(schema, encoding));
    }
    return function () {
        var tokens = arguments.length <= 0 || arguments[0] === undefined ? process.argv.slice(1) : arguments[0];
        return parse({ schema: schema, tokens: tokens });
    };
}