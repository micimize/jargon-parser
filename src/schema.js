import { readFileSync } from 'fs'
import Ajv from 'ajv'
import addMergePatch from 'ajv-merge-patch'

export function newAjvCompiler(options = { coerceTypes: true, useDefaults: true, v5: true }){
  let ajv = new Ajv(options)
  addMergePatch(ajv)
  return ajv
}

const defaultAjv = newAjvCompiler()

export function newCaster({
  schema,
  encoding = 'utf-8',
  compiler: ajv = defaultAjv
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
