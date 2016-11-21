import subarg from 'subarg'
import { newCaster } from './schema'
import { thread } from './utils'
import { newHelpWrapper } from './help'

/*
 * essentially the only difference between subarg's result and jargon's result is that
 * arrays and dictionaries are mutually exclusive in json so we reduce all the '_' keys
 */
function normalizeSubargs({ '_': list, ...obj}){

  let normalize = token => typeof(token) == 'object' ? normalizeSubargs(token) : token

  if (list.length && Object.keys(obj).length){
    throw TypeError(`
      Lists and Objects cannot coexist under the same key.
        List: ${list}
        Object: ${obj}
    `)
  }

  if(list.length){
    return list.map(normalize)

  } else {
    return Object.keys(obj).reduce(
      (o, key) => Object.assign(o, { [key]: normalize(obj[key]) }),
      {})
  }
}

export default function newParser({
  schema,
  schemaCaster,
  name,
  helpOptions = {
    flag: 'help',
    catchErrors: true
  }}){
  const caster = schemaCaster || newCaster({ schema })
  const helpWrapper = newHelpWrapper({ name, schema, ...helpOptions })
  function parser(tokens = process.argv.slice(2)){
    return thread(tokens, [
        subarg,
        normalizeSubargs,
        caster
      ])
  }
  return helpWrapper(parser)
}
