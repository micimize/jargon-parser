import $RefParser from 'json-schema-ref-parser'
import { loopWhile } from 'deasync'

function isKey(token){
    return /^-.+/.test(token)
}

function normalize({token}){
    if(token.startsWith('--')){
        return token.substr(2)
    } else if(token.startsWith('-')){
        return token.substr(1)
    } else {
        return token
    }
}

function readSubschema({schema, key}){
    var subSchema, done = false; 
    $RefParser.dereference(schema, (err, schema) => {
        if (err) {
            console.error(err);
            process.exit()
        }
        while (schema.type == 'array') {
            // TODO this won't work on arrays of arrays of objects...
            schema = schema.items
        }
        if(schema.type == 'object'){
            subSchema = schema.allOf && schema.allOf.length ?
                schema.allOf.reduce((props, sub) => Object.assign(props, sub.properties || {}), {})[key] :
                schema.properties[key]
            done = true
        } else {
            console.error(`schema ${schema} is not an object, or array of objects (failure on flag ${key})`);
            process.exit()
        }
    })
    loopWhile(_ => !done)
    return { subSchema, defaultValue: subSchema.default || undefined }
}

export default function schemaResolverFromParser({parsers}){
    function schemaResolver({schema: currentSchema, token = undefined}){
        if(token === undefined){
            return {
                parser: parsers[currentSchema.type],
                schemaResolver: ({schema = currentSchema, token}) => schemaResolver({schema, token}),
            }
        } else {
            let key = normalize({token})
            let { subSchema, defaultValue } = readSubschema({schema: currentSchema, key})
            return { key, defaultValue, ...schemaResolver({schema: subSchema}) }
        }

    }
    return schemaResolver
}
