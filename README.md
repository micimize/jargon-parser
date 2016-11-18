# Jargon Parser: argument parsers from json schemas, using [subarg](https://github.com/substack/subarg) syntax and the [ajv validator](https://github.com/epoberezkin/ajv)
```bash
node test/parser.js                                 \
    --billing_address [                             \
        --street_address "1234 fake st" ]           \
    --shipping_address [                            \
        --street_address "2222 muddle drive"        \
        --city houston --type business ] \
    --items [ [ --name foo ] [ --price 0.99 --name bar ] bar ]
```
yields
```json
{
    "billing_address": {
        "city": "austin",
        "state": "tx",
        "street_address": "1234 fake st"
    },
    "shipping_address": {
        "city": "houston",
        "state": "tx",
        "street_address": "2222 muddle drive",
        "type": "business"
    },
    "items": [
        {
            "name": "foo"
        },
        {
            "name": "bar",
            "price": 0.99
        }
    ],
}
```
given the sample schema in [`examples/schema.json`](example/schema.json) (notice that `default`s are applied).
  
Jargon functions mostly the same as [subarg](https://github.com/substack/subarg), except that arrays and dictionaries are mutually exclusive in json. This means that `cli command --sub [ args args -f ]` is invalid, because it  the `subarg` result is
```json
{
  "_": [ "command" ],
  "sub": {
    "_": [ "args" , "args" ],
    "f": true
  }
}
```
So `[ "command" ]` and `{ "sub": ... }` would be in conflict,
as would `[ "args" , "args" ]` and `{ "f": true }`.  
A valid alternative would be `cli command [ --sub [ --list [ args args ] -f ] ]`, resulting in 
```json
{
  "command": {
    "sub": {
      "list": [ "args" , "args" ],
      "f": true
    }
  }
}
```
