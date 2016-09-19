'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.string = string;
exports.number = number;
exports.integer = integer;
exports.boolean = boolean;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function string(_ref) {
    var _ref$tokens = _toArray(_ref.tokens);

    var value = _ref$tokens[0];

    var remainder = _ref$tokens.slice(1);

    return { value: value, remainder: remainder };
}
function number(_ref2) {
    var _ref2$tokens = _toArray(_ref2.tokens);

    var value = _ref2$tokens[0];

    var remainder = _ref2$tokens.slice(1);

    return { value: Number(value), remainder: remainder };
}
function integer(_ref3) {
    var _ref3$tokens = _toArray(_ref3.tokens);

    var value = _ref3$tokens[0];

    var remainder = _ref3$tokens.slice(1);

    return { value: parseInt(value), remainder: remainder };
}

function boolean(_ref4) {
    var _ref4$tokens = _toArray(_ref4.tokens);

    var value = _ref4$tokens[0];

    var remainder = _ref4$tokens.slice(1);

    if (/^(true|false)$/.test(value)) {
        return { value: value === 'true', remainder: remainder };
    } else {
        return { value: true, remainder: [value].concat(_toConsumableArray(remainder)) };
    }
}

/*
export function null({tokens}){
    if (value == 'null') {
        return {value: null, remainder}
    } else {
        return { remainder: [value, ...remainder] }
    }
}
*/