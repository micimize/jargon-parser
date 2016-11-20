const newParser = require('../dist').default

const cli = newParser({ name: 'example/parser', schema: __dirname + '/schema.json' })

console.log(JSON.stringify(cli()))
