const newParser = require('../dist').default

const cli = newParser({ schema: __dirname + '/schema.json' })

console.log(JSON.stringify(cli()))
