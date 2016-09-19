import * as primitives from './primitiveTypeParsers'

let escapeCommand = ','

function isKey(token){
    return /^-.+/.test(token)
}

export function array({schemaResolver, tokens: [token, ...tokens]}){
    let value = []
    while(token){
        if( token == escapeCommand ){
            break;
        }
        if( isKey(token) ){
            let {value: subValue, remainder: [newToken, ...newTokens]} = object({schemaResolver, tokens: [token, ...tokens]})
            value.push(subValue)
            token = newToken
            tokens = newTokens
        } else {
            value.push(token)
            let [newToken, ...newTokens] = tokens
            token = newToken
            tokens = newTokens
        }
    }
    return { value, remainder: tokens }
}

export function object({schemaResolver, tokens: [token, ...tokens]}){
    let value = {}
    while(typeof(token) == 'string'){
        if( token == escapeCommand ){
            break;
        }
        let { key, defaultValue = undefined, parser: subParser, schemaResolver: subSchemaResolver } = schemaResolver({token})
        let { value: subValue = defaultValue, remainder: [newToken, ...newTokens] } = subParser({schemaResolver: subSchemaResolver, tokens})
        token = newToken
        tokens = newTokens
        value[key] = subValue
    }
    return { value, remainder: tokens }
}

