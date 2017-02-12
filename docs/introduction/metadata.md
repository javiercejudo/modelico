### Metadata

Each of the types above has an associated metadata
function in `M.metadata()`, with some useful additions:

```js
const {
  _,           // to retrieve the metadata of arbitrary types, eg. _(Animal)
  base,        // to retrieve the metadata of standard models for extension
  asIs,        // useful for simple transforms, eg: asIs(x => 2 * x) to double numbers
  any,         // to leave JSON input untouched
  maybe,       // to declare a value as optional
  withDefault, // to set a default if the value is missing
  number,      // for native numbers, but optionally wraps to support -0 and ±Infinity
               // eg. number({wrap: true})

  string,      // remember they are all functions, eg. string(), list(date())
  boolean,
  regExp,
  fn,

  map,
  enumMap,
  stringMap,
  list,
  set,
  date
} = M.metadata()
```
