import { dereferenceSync } from './schema'
import cliui from 'cliui'
import path from 'path'

const defaultFormat = {
  string: v => (v ? `[default: "${v}"]` : ''),
  number: v => (v ? `[default: ${v}]` : ''),
  boolean: v => (typeof(v) == 'boolean' ? `[default: ${v}]` : '')
}

function stdFormat({default: v, help = '', optional}, { type, wrapDefault = _=>_ } = {}){
  return [
    (type ? `<${type}> ` : ''),
    (v ? `[default: ${wrapDefault(v)}]` : (optional ? '[optional]' : '[required]')),
    (help.length ? `# ${help}` : '')
  ].join('\t')
}

const inlineFormat = {
  string(details){
    return stdFormat(details, { wrapDefault: d=>`"${d}"`, type: 'string' })
  },
  number(details){
    return stdFormat(details, { type: 'number' })
  },
  boolean: stdFormat,

  // TODO default formatter for array and obj
  object({ help = '', default: defaultValue, properties, ...details }){
    return `[ <properties> ] ${help}`
  },
  array({ help = '', default: defaultValue, ...details }){
    return `[ <item>... ] ${help}`
  },
}

function inlineFormatter({ type, ...details }){
  return inlineFormat[type](details)
}

function resolveProperties({ properties, allOf }){
  return properties || Object.assign({}, ...allOf.map(resolveProperties))
}

function formatProperties({properties, keys, optional}){
  return keys.map(p => `\n--${p} ${verboseFormatter({optional, ...properties[p]})}`).join('')
}

const verboseFormat = {
  ...inlineFormat,
  array({ help = '', default: defaultValue, items, ...details }){
    return `${verboseFormatter(items)}, ...items`
  },
  object({ help = '', default: defaultValue, required = [], ...details }){
    let properties = resolveProperties(details)
    let optional = Object.keys(properties).filter(p => !required.includes(p))
    return [
      (help.length ? `# ${help}` : ''),
      formatProperties({ properties, keys: required}), 
      (optional.length ? formatProperties({ properties, keys: optional, optional: true}) : '')
    ].join('\n').trim().replace(/\n *\n/g, '\n')
  },
}

function indent(str){
  return str.replace(/^(?=[^\n])/, '\n').replace(/\n/g, '\n  ').replace(/(?=[^\n *])$/, '\n')
}

function nest(type, str){
  if(['object', 'array'].includes(type)){
    return `[${indent(str)}\n]`
  }
  return str
}

function verboseFormatter({ type, ...details }, nested=true){
  if(nested)
    return nest(type, verboseFormat[type](details));
  return verboseFormat[type](details)
}

export default function help({ name='jargon', schema }){
  let ui = cliui()
  ui.div(`Usage: ${name} ${indent(verboseFormatter(dereferenceSync(schema), false))}`)
  return ui.toString()
}

export function newHelpWrapper({
  name=path.relative(process.cwd(), process.argv[1]),
  flag='help',
  catchErrors=true,
  schema
}){
  const helpStatement = help({ name, schema })
  function displayHelp(){
    console.info(helpStatement)
    process.exit()
  }
  function helpWrapper(func){
    return (tokens = process.argv.slice(2), ...args) => {
      if (tokens.includes(`--${flag}`))
        displayHelp();

      try {
        return func(tokens, ...args)

      } catch(err) {
        console.log('caught')
        if(catchErrors){
          console.error(err.message)
          //console.error(err.stack)
          displayHelp()

        } else {
          throw err
        }
      }
    }
  }
  return helpWrapper
}
