import subarg from 'subarg'
import { casterFactory } from './schema'
import { thread } from './utils'

/*
 * essentially the only difference between subarg's result and jargon's result is that
 * arrays and dictionaries are mutually exclusive in json so we reduce all the '_' keys
 */
function normalizeSubargs({ '_': list, ...obj}){

  let normalize = token => typeof(token) == 'object' ? normalizeSubargs(token) : token

  if (list.length && Object.keys(obj).length){
    console.log(`
      list: ${list}
      obj: ${obj}
    `)
    throw TypeError("arrays and objects cannot coexist under the same key")
  }

  if(list.length){
    return list.map(normalize)

  } else {
    return Object.keys(obj).reduce(
      (o, key) => Object.assign(o, { [key]: normalize(obj[key]) }),
      {})
  }
}

export default function parser({schema, ...casterArgs}){
  let castToSchema = casterFactory({ schema, ...casterArgs })
  return (tokens = process.argv.slice(2)) => thread(
    tokens, [
        subarg,
        normalizeSubargs,
        castToSchema
    ]
  )
}
