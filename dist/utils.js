'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.thread = thread;
exports.collapseMerge = collapseMerge;
exports.collapseAllOf = collapseAllOf;
exports.collapse = collapse;
exports.merge = merge;
exports.expand = expand;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function thread(value, functions) {
    return functions.reduce(function (value, f) {
        return f(value);
    }, value);
}

function collapseMerge(schema) {
    if (schema['$merge']) {
        var _merge = schema['$merge'];
        delete schema['$merge'];
        schema.properties = Object.assign(schema.properties, Object.assign(collapseMerge(_merge.source).properties, collapseMerge(_merge.with).properties));
    }
    return schema;
}

function collapseAllOf(schema) {
    if (schema.allOf && schema.allOf.length) {
        var allOf = schema['allOf'];
        delete schema['allOf'];
        schema.properties = allOf.reduce(function (props, sub) {
            return Object.assign(props, collapseAllOf(sub).properties || {});
        }, schema.properties || {});
    }
    return schema;
}

function collapse(schema) {
    return collapseAllOf(collapseMerge(schema));
}

function merge() {
    for (var _len = arguments.length, schemas = Array(_len), _key = 0; _key < _len; _key++) {
        schemas[_key] = arguments[_key];
    }

    return schemas.reduce(function (merged, schema) {
        return {
            "$merge": {
                "source": merged,
                "with": schema
            }
        };
    }, {});
}

var defaultBaseSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "definitions": {}
};

function expand(schemaMap) {
    var baseSchema = arguments.length <= 1 || arguments[1] === undefined ? defaultBaseSchema : arguments[1];

    var keys = Object.keys(schemaMap);
    var base = Object.assign(baseSchema, merge(keys.map(function (key) {
        return { "$ref": '#/definitions/' + key };
    })));
    return keys(schemaMap).reduce(function (_ref, key) {
        var definitions = _ref.definitions;

        var schema = _objectWithoutProperties(_ref, ['definitions']);

        return _extends({}, schema, {
            definitions: _extends(_defineProperty({}, key, schemaMap[key]), definitions)
        });
    }, base);
}