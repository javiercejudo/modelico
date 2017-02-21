# Metadata

Each of the types above has an associated metadata
function in `M.metadata()`, with some useful additions:

```js
const {
  _,
  base,
  asIs,
  any,
  anyOf,
  maybe,
  withDefault,

  number,
  string,
  boolean,
  date,

  map,
  enumMap,
  stringMap,
  list,
  set
} = M.metadata()
```

##### \_(Type, innerMetadata = [])

eg. `_(Animal)`, `_(M.List, [string()])`, `_(M.Map, [date(), number()])`

To retrieve the metadata of Modélico types

##### base(Type)

Retrieve the metadata of standard models for extension. See
[JSON validation (Overridingthe reviver)](../advanced/json_validation.md#overriding-the-reviver)
for an example.

##### asIs(transform = identity)

Useful for simple transformations, eg.: `asIs(x => 2 * x)` to double numbers.
It serves as base for primitive metadata and can be used to fix a value
for debugging purposes, eg.: `asIs(() => 0)`.
It is up to you to implement `toJSON()` on the instance to reverse the
transformation if you need to.

##### any()

Leaves the JSON input untouched (same as `asIs(identity)`).

##### anyOf([[metadata1, enumValue1], ..., [metadataN, enumValueN]] = [], field = 'type')

Useful to revive polymorphic JSON based on an enumerated field. The field
defaults to `type` if not provided. See
[Reviving polymorphic JSON: (example 1)](../advanced/reviving_polymorphic_json.md#example-1-revive-based-on-an-enumerated-field)
for an example. Note that `anyOf` does not return metadata, but a
metadata-returning function. This is something you can use as well to revive
some cases of polymorphic JSON.

##### number({wrap = false} = {})

For native numbers, but optionally wraps to support `-0`, `NaN` and
±`Infinity`.

##### string()

##### boolean()

##### date()

To parse `date-time` strings, as defined by
[RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6), eg.
`1978-12-06T00:00:00.000Z`.

##### map(keyMetadata = any(), valueMetadata = any())

eg. `map(date(), string())`

For ordered maps with arbitrary keys and values with JSON representation

```
[[<key1>, <value1>], [<key2>, <value2>]]
```

##### enumMap(enumMetadata, valueMetadata = any())

eg. `enumMap(_(MyEnum), number())`

For ordered maps with enum keys and arbitrary values with JSON representation

```
{"<enum1>": <value1>, "<enum2>": <value2>}
```

##### stringMap(valueMetadata = any())

eg. `stringMap(date())`

For ordered maps with string keys and arbitrary values with JSON representation

```
{"<string1>": <value1>, "<string2>": <value2>}
```

##### list(itemMetadata = any()), list([...itemMetadata])

eg. `list(string())`; tuples: `list([number(), string()])`

For arrays. It has support for tuples in the sense of fixed-length arrays with
per-item metadata.

##### set(itemMetadata)

eg. `set(number())`

For ordered collections with no repeated values

##### maybe(metadata = any())

eg. `maybe(string())`

To declare a value as optional. Unless a value is a `Maybe`, it cannot be
missing from the JSON or be `null`. See
[Optional / null values: Maybes](../basics/optional_values.md#maybes) for more
details.

##### withDefault(metadata, default)

eg. `withDefault(number(), 100)`

To set a default if the value is `null` or missing. See
[Optional / null values: using with default](../basics/optional_values.md#using-withdefault)
for more details.
