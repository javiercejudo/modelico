[« back to readme](../README.md)

# JSON validation

By default, Modélico does not validate JSON in any special way. Morover, the
JSON is coerced when the metadata defined doesn't match the actual value, eg.
if a field has `string()` as its metadata, but there is a number in the
incoming JSON, it will be coerced with `String(5)`.

To validate the JSON strictly, you have two options:

- use `M.ajvMetadata` for [Ajv](https://epoberezkin.github.io/ajv/)'s implementation of [JSON schema](http://json-schema.org/).
- manually create validation functions that work as revivers;

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
const { string, list, number } = M.ajvMetadata(ajvIfProd)

class Animal extends M.Base {
  constructor (fields) {
    super(Animal, fields)
  }

  static innerTypes () {
    return Object.freeze({
      name: string({ minLength: 1, maxLength: 25 }),
      dimensions: list({ minItems: 3, maxItems: 3 }, number({ minimum: 0, exclusiveMinimum: true }))
    })
  }
}
```

_Note: if you are using Modélico in the browser, you need to load Ajv as it is
not bundled with Modélico.
[See instructions here](https://epoberezkin.github.io/ajv/#using-in-browser)._

## Custom validation metadata

If you only need to validate certain fields or you have custom rules that are
not covered by what JSON schema can validate, you may write your own metadata:

```js
const { string, list, number } = M.metadata

// boundedString is going to return metadata that validates the string length
// before reviving it by overriding the string metadata revive
const boundedString = (min = 0, max = Infinity) => {
  const stringMeta = string()

  const reviver = (k, v) => {
    if (k !== '') {
      return v
    }

    if (typeof v !== 'string' || v.length < min || v.length > max) {
      throw TypeError('not a string or string is out of bounds')
    }

    // In this case, we could return v directly since strings are the same in
    // JSON and JavaScript. However, this is the solution for general types.
    return stringMeta.reviver('', v)
  }

  return Object.assign({}, stringMeta, { reviver })
}

class Animal extends M.Base {
  constructor (fields) {
    super(Animal, fields)
  }

  static innerTypes () {
    return Object.freeze({
      name: boundedString(1, 25),
      dimensions: list(number())
    })
  }
}
```
