[« back to readme](../README.md)

# JSON validation

By default, Modélico does not validate JSON in any special way. Morover, the
JSON is coerced when the metadata defined doesn't match the actual value, eg.
if a field has `string()` as its metadata, but there is a number in the
incoming JSON, it will be coerced with `String(5)`.

To validate the JSON strictly, you have the following options:

- use `M.ajvMetadata` for [Ajv](https://epoberezkin.github.io/ajv/)'s implementation of [JSON schema](http://json-schema.org/);
- manually create validation functions that work as revivers;
- a bit of both

## `M.ajvMetadata` and JSON schema

This variation of `M.metadata()` takes an optional `Ajv` instance parameter
and returns metadata functions that take an additional initial parameter in
the form of JSON schema for the current field. When no instance of `Ajv` is
passed in, it returns metadata functions with the same API but no validation
is performed. This can be leveraged to only enable validation during
development in favour of faster parsing in production:

```js
const ajvOptions = {}
const ajvIfProd = (ENV === 'development') ? Ajv(ajvOptions) : undefined;
const { ajvString, ajvList, ajvNumber } = M.ajvMetadata(ajvIfProd)

class Animal extends M.Base {
  constructor (fields) {
    super(Animal, fields)
  }

  static innerTypes () {
    return Object.freeze({
      name: ajvString({ minLength: 1, maxLength: 25 }),
      dimensions: ajvList({ minItems: 3, maxItems: 3 }, ajvNumber({ minimum: 0, exclusiveMinimum: true }))
    })
  }
}
```

_Note: if you are using Modélico in the browser, you need to load Ajv as it is
not bundled with Modélico.
[See instructions here](https://epoberezkin.github.io/ajv/#using-in-browser)._

## Custom validation metadata

If you only need to validate certain fields or you have custom rules that are
not covered by what JSON schema can validate, you may write your own metadata.
`M.withValidation` facilitates this use case.

```js
const { string, list, number } = M.metadata()

// lowerCaseString is going to return metadata that validates the string
// before reviving it by overriding the string metadata reviver
const lowerCaseString = () => M.withValidation(
  v => v.toLowerCase() === v
  (v, path) => `string ${v} at ${path.join(' > ')} is not all lower case`
)(string())

class Animal extends M.Base {
  constructor (fields) {
    super(Animal, fields)
  }

  static innerTypes () {
    return Object.freeze({
      name: lowerCaseString(),
      dimensions: list(number())
    })
  }
}
```

## Why not both?

In the example above, we could have based `lowerCaseString` on `ajvString`
instead of the normal `string` to combine custom and JSON schema rules.

`M.withValidation` works with any metadata, including the `Ajv` variant and
can be composed, since it returns metadata.

```js
const lowerCaseString = schema => M.withValidation(
  v => v.toLowerCase() === v,
  (v, path) => `string ${v} at ${path.join(' > ')} is not all lower case`
)(ajvString(schema))
```

Now we can define fields with something like `lowerCaseString({minLength: 5})`.
