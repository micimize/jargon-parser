import * as primitives from './primitiveTypeParsers'
import * as recursives from './recursiveTypeParsers'
import schemaResolverFromParsers from '../schemaResolver'
import { readFileSync } from 'fs'
import Ajv from 'ajv'
import addMergePatch from 'ajv-merge-patch'

let ajv = new Ajv({ coerceTypes: true, useDefaults: true, v5: true })
addMergePatch(ajv)

function parse({schema, tokens: [token, ...tokens]}){
    let validate = ajv.compile(schema)

    let resolverFromSchema = schemaResolverFromParsers({parsers: {...primitives, ...recursives}})
    let { parser, schemaResolver } = resolverFromSchema({schema})
    let { value: options, remainder: unknown } = parser({schemaResolver, tokens})

    if(!validate(options)){
        console.log(validate.errors);
    }

    return {options, unknown}
}

export default function parser({schema, encoding='utf-8'}){
    if (typeof(schema) == 'string'){
        schema = JSON.parse(readFileSync(schema, encoding))
    }
    return (tokens = process.argv.slice(1)) => parse({schema, tokens})
}
