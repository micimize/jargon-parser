var subarg = require('subarg');
var argv = subarg(process.argv.slice(2));
console.log(JSON.stringify(argv));
