import { readFileSync } from 'fs'
import Ajv from 'ajv'
import addMergePatch from 'ajv-merge-patch'

export function ajvCompiler(options = { coerceTypes: true, useDefaults: true, v5: true }){
  let ajv = new Ajv(options)
  addMergePatch(ajv)
  return ajv
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

export function casterFactory({
  schema,
  encoding = 'utf-8',
  compiler: ajv = ajvCompiler()
}){
  if (typeof(schema) == 'string'){
    schema = JSON.parse(readFileSync(schema, encoding))
  }
  let validate = ajv.compile(schema)
  function cast(options){
    if(!validate(options)){
      throw new Error(ajv.errorsText(validate.errors))
    }
    return options
  }
  return cast
}
