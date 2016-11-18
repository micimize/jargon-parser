'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ajvCompiler = ajvCompiler;
exports.casterFactory = casterFactory;

var _fs = require('fs');

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _ajvMergePatch = require('ajv-merge-patch');

var _ajvMergePatch2 = _interopRequireDefault(_ajvMergePatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ajvCompiler() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? { coerceTypes: true, useDefaults: true, v5: true } : arguments[0];

  var ajv = new _ajv2.default(options);
  (0, _ajvMergePatch2.default)(ajv);
  return ajv;
}

/*export function prettyError({
  keyword, dataPath, schemaPath, params, message,
  schema, parentSchema, data 
}){
  return `
    failed ${keyword} check at ${schemaPath}:
    ${dataPath} ${message}
  `
}
console.error(`validation errors: `, validate.errors.map(prettyError).join('\n'))*/

function casterFactory(_ref) {
  var schema = _ref.schema;
  var _ref$encoding = _ref.encoding;
  var encoding = _ref$encoding === undefined ? 'utf-8' : _ref$encoding;
  var _ref$compiler = _ref.compiler;
  var ajv = _ref$compiler === undefined ? ajvCompiler() : _ref$compiler;

  if (typeof schema == 'string') {
    schema = JSON.parse((0, _fs.readFileSync)(schema, encoding));
  }
  var validate = ajv.compile(schema);
  function cast(options) {
    if (!validate(options)) {
      throw new Error(ajv.errorsText(validate.errors));
    }
    return options;
  }
  return cast;
}