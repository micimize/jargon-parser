export function collapseMerge(schema){
    if(schema['$merge']){
        let merge = schema['$merge']
        delete schema['$merge']
        schema.properties = Object.assign(schema.properties, Object.assign(
            collapseMerge(merge.source).properties,
            collapseMerge(merge.with).properties
        ))
    } 
    return schema
}

export function collapseAllOf(schema){
    if(schema.allOf && schema.allOf.length){
        let allOf = schema['allOf']
        delete schema['allOf'] 
        schema.properties = allOf.reduce((props, sub) => Object.assign(props,
            collapseAllOf(sub).properties || {}
        ), schema.properties || {})
    }
    return schema
}

export function collapse(schema){
    return collapseAllOf(collapseMerge(schema))
}

export function merge(...schemas){
    return schemas.reduce((merged, schema) => ({
        "$merge": {
            "source": merged,
            "with": schema
        }
    }), {})
}

let defaultBaseSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "definitions": {},
}

export function expand(schemaMap, baseSchema=defaultBaseSchema){
    let keys = Object.keys(schemaMap)
    let base = Object.assign(baseSchema, merge(keys.map(key => ({"$ref": `#/definitions/${key}`}))))
    return keys(schemaMap).reduce( ({definitions, ...schema}, key) => ({
        ...schema,
        definitions: {
            [key]: schemaMap[key], ...definitions
        }
    }), base)
}

