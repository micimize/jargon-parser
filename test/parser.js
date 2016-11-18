const parser = require('../dist').default

const cli = parser({schema: './example/schema.json'})

console.log(JSON.stringify(cli()))
