# Jargon Parser: argument parsers from json schemas, using subarg
```bash
node test/parser.js                                 \
    --billing_address [                             \
        --street_address "1234 fake st"             \
        --city austin --state tx ]                  \
    --shipping_address [                            \
        --street_address "2222 muddle drive"        \
        --city houston --state tx --type business ] \
    --items [ [ --name foo ] [ --price 0.99 --name bar ] ] \
```
yields
```json
{
    "options": {
        "billing_address": {
            "city": "austin",
            "state": "tx",
            "street_address": "1234 fake st"
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
        "shipping_address": {
            "city": "houston",
            "state": "tx",
            "street_address": "2222 muddle drive",
            "type": "business"
        }
    },
    "unknown": []
}
```
given the sample schema in [`examples/schema.json`](example/schema.json)


* "," command escapes the current nesting level for recursive structures
* the current implementation has very limited functionality
