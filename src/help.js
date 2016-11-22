import { dereferenceSync } from './schema'
import cliui from 'cliui'
import colors from 'colors'
import path from 'path'

const defaultFormat = {
  string: v => (v ? `[default: "${v}"]` : ''),
  number: v => (v ? `[default: ${v}]` : ''),
  boolean: v => (typeof(v) == 'boolean' ? `[default: ${v}]` : '')
}

function stdFormat({type='any', default: v, help = '', optional}, { wrapDefault = _=>_, wrapType = _=>_ } = {}){
  if(type == 'string') {
    wrapDefault = d=>`"${d}"`
  }
  if(Array.isArray(type)){
    type = type.join('|')
  }
  return [
    wrapType(`<${type}>`) + ' ',
    (v ? `[default: ${wrapDefault(v)}]` : (optional ? '[optional]' : '[required]')),
    (help.length ? `# ${help}` : '')
  ].join('\t')
}

function resolveProperties({ properties, allOf }){
  return properties || Object.assign({}, ...allOf.map(resolveProperties))
}

function formatProperties({properties, keys, optional}){
  return keys.map(p => `\n--${p} ${verboseFormatter({optional, ...properties[p]}, {property: p})}`).join('')
}

const verboseFormat = {
  array({ help = '', default: defaultValue, items, ...details }, { nested, property='items' }){
    if(items.type == 'object'){
      return nest(verboseFormatter(items, {nested: true, wrapType: type => `${type},\n...${property}`}), help)
    } else {
      return verboseFormatter({help, ...items}, {nested: false, wrapType: type => `[ ${type}, ...${property} ]`})
    }
  },
  object({ help = '', default: defaultValue, required = [], ...details }, { nested, wrapType = _=>_ }){
    let properties = resolveProperties(details)
    let optional = Object.keys(properties).filter(p => !required.includes(p))
    let formatted = [
      formatProperties({ properties, keys: required}), 
      (optional.length ? formatProperties({ properties, keys: optional, optional: true}) : '')
    ].join('\n').trim().replace(/\n *\n/g, '\n')
    return wrapType(nested ? nest(formatted, help) : formatted)
  },
}

function indent(str){
  return str.replace(/^(?=[^\n])/, '\n').replace(/\n/g, '\n  ').replace(/(?=[^\n *])$/, '\n')
}

function nest(str, help=''){
  return `[\t\t${(help.length ? '# ' + help : '')}${indent(str)}\n]`
}

function verboseFormatter(details, { nested=true, wrapType=_=>_, ...rest } = {}){
  let configuration = { nested, wrapType, ...rest }
  return verboseFormat[details.type] ?
    verboseFormat[details.type](details, configuration) :
    stdFormat(details, configuration)
}

function greater(val, val2){
  return (val < val2) ? val2 : val
}

function getMaxWidths(rows){
  let widths = rows.reduce(({flagInfo, required, help}, row) => {
      let [f = '', r = '', h = ''] = row.split('\t')
      flagInfo = greater(flagInfo, f.length)
      required = greater(required, r.length)
      help = greater(help, h.length)
      return {flagInfo, required, help}
    }, {flagInfo: 0, required: 0, help: 0})
  let desiredHelpWidth = widths.help
  widths.help = process.stdout.columns - widths.required - widths.flagInfo - 8 // padding
  if (widths.help < 0 /*|| widths.help < desiredHelpWidth / 4*/){
    return {flagInfo: 0, required: 0, help: 0}
  }
  return widths
}

function buildColumns(row, widths){
  let [flagInfo, required ='', help = ''] = row.split('\t')
  return [{
    text: flagInfo,
    width: widths.flagInfo + 4,
    padding: [0, 2, 0, 2 + flagInfo.search(/\S|$/)]
  }, {
    text: required,
    width: widths.required + 2,
    padding: [0, 2, 0, 0]
  }, {
    text: help,
    width: widths.help + 2,
    padding: [0, 2, 0, 0]
  }]
}

function formatHelp(str){
  let ui = cliui({ width: process.stdout.columns })
  let rows = str.split('\n')
  let widths = getMaxWidths(rows)
  rows.map(row => buildColumns(row, widths))
    .forEach(row => ui.div(...row))
  return ui.toString()
}

export default function help({ name='jargon', description, schema }){
  schema = dereferenceSync(schema)
  let topLevelDescription = description ? '\n' + description :
                            schema.help ? `\n\n${schema.help}\n` : ''
  try {
    return `\nUsage: ${name} ${topLevelDescription} \nArguments:\n\n` +
      formatHelp(verboseFormatter(schema , { nested: false }))
  } catch(err) {
    console.error(err)
    let ui = cliui({ width: process.stdout.columns })
    ui.div({
      padding: [1, 2, 1, 2],
      text: colors.red.bold('Jargon Parser Encountered error while building help statement\n')   +
            'The given schema is probably too complex for the help generator. \n' +
            `Please open an issue at ${colors.blue.underline('https://github.com/polypacker/jargon-parser/issues')} ` +
            'with your stacktrace and schema, so we can work on supporting it.' })
    return ui.toString()
  }
}

export function newHelpWrapper({
  name=path.relative(process.cwd(), process.argv[1]),
  flag='help',
  catchErrors=true,
  schema, ...rest
}){
  const helpStatement = help({ name, schema, ...rest })
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
