'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = schemaResolverFromParser;

var _jsonSchemaRefParser = require('json-schema-ref-parser');

var _jsonSchemaRefParser2 = _interopRequireDefault(_jsonSchemaRefParser);

var _deasync = require('deasync');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isKey(token) {
    return (/^-.+/.test(token)
    );
}

function normalize(_ref) {
    var token = _ref.token;

    if (token.startsWith('--')) {
        return token.substr(2);
    } else if (token.startsWith('-')) {
        return token.substr(1);
    } else {
        return token;
    }
}

function readSubschema(_ref2) {
    var schema = _ref2.schema;
    var key = _ref2.key;

    var subSchema,
        done = false;
    _jsonSchemaRefParser2.default.dereference(schema, function (err, schema) {
        if (err) {
            console.error(err);
            process.exit();
        }
        while (schema.type == 'array') {
            // TODO this won't work on arrays of arrays of objects...
            schema = schema.items;
        }
        if (schema.type == 'object') {
            subSchema = (0, _utils.collapse)(schema).properties[key];
            done = true;
        } else {
            console.error('schema ' + schema + ' is not an object, or array of objects (failure on flag ' + key + ')');
            process.exit();
        }
    });
    (0, _deasync.loopWhile)(function (_) {
        return !done;
    });
    return { subSchema: subSchema, defaultValue: subSchema.default || undefined };
}

function schemaResolverFromParser(_ref3) {
    var parsers = _ref3.parsers;

    function _schemaResolver(_ref4) {
        var currentSchema = _ref4.schema;
        var _ref4$token = _ref4.token;
        var token = _ref4$token === undefined ? undefined : _ref4$token;

        if (token === undefined) {
            return {
                parser: parsers[currentSchema.type],
                schemaResolver: function schemaResolver(_ref5) {
                    var _ref5$schema = _ref5.schema;
                    var schema = _ref5$schema === undefined ? currentSchema : _ref5$schema;
                    var token = _ref5.token;
                    return _schemaResolver({ schema: schema, token: token });
                }
            };
        } else {
            var key = normalize({ token: token });

            var _readSubschema = readSubschema({ schema: currentSchema, key: key });

            var subSchema = _readSubschema.subSchema;
            var defaultValue = _readSubschema.defaultValue;

            return _extends({ key: key, defaultValue: defaultValue }, _schemaResolver({ schema: subSchema }));
        }
    }
    return _schemaResolver;
}