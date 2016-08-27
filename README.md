
```bash
node test/parser.js                                 \
    --billing_address                               \
        --street_address "1234 fake st"             \
        --city austin --state tx ,                  \
    --shipping_address                              \
        --street_address "2222 muddle drive"        \
        --city houston --state tx --type business , \
    --items --name foo , --price 0.99 --name bar
```
yields
```json
{ options:
   { billing_address:
      { street_address: '1234 fake st',
        city: 'austin',
        state: 'tx' },
     shipping_address:
      { street_address: '2222 muddle drive',
        city: 'houston',
        state: 'tx',
        type: 'business' },
     items: [ { name: 'foo' }, { price: 0.99, name: 'bar' } ] },
  unknown: [] }
```
given the sample schema in [`examples/schema.json`](example/schema.json)
