import { dereferenceSync } from './schema'

const defaultFormat = {
  string: v => (v ? `[default: "${v}"], ` : ''),
  number: v => (v ? `[default: ${v}], ` : ''),
  boolean: v => (typeof(v) == 'boolean' ? `[default: ${v}], ` : '')
}

const inlineFormat = {
  string({ help, default: defaultValue, ...details }){
    return `<string> ${defaultFormat.string(defaultValue)}${help}`
  },
  number({ help, default: defaultValue, ...details }){
    return `<number> ${defaultFormat.number(defaultValue)}${help}`
  },
  boolean({ help, default: defaultValue, ...details }){
    return `${defaultFormat.boolean(defaultValue)}${help}`
  },

  // TODO default formatter for array and obj
  object({ help, default: defaultValue, properties, ...details }){
    return `[ <properties> ] ${help}`
  },
  array({ help, default: defaultValue, ...details }){
    return `[ <items>... ] ${help}`
  },
}

function inlineFormatter({ type, ...details }){
  return inlineFormat[type](details)
}

const verboseFormat = {
  ...inlineFormat,
  array({ help, default: defaultValue, items, ...details }){
    return `[
      ${verboseFormat(items)}, ...
    ]`
  },
  object({ help, default: defaultValue, properties, required = [], ...details }){
    let optional = Object.keys(properties).filter(p => !required.includes(p))
    let optionalHelp = optional.length ? `
    optional: ${optional.map(p => `
    --${p} ${inlineFormatter(properties[p])}`)}` : ''
    
    return `
  [ ${required.map(p => `
    --${p} ${inlineFormatter(properties[p])}`)}
    ${ optionalHelp }
  ]`
  },
}

export default function help({ name='jargon', schema }){
  const { type, ...dereferencedSchema } = dereferenceSync(schema)
  return `${name} ${verboseFormat[type](dereferencedSchema)}`
}


export function newHelpWrapper({ name='jargon', flag='help', catchErrors=true, schema }){
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
