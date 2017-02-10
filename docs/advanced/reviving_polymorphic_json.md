# Reviving polymorphic JSON

The [built-in metadata](../README.md#metadata) covers the bulk of use cases.
However, to deal with types whose JSON might take more than one form, you will
need a custom reviving strategy.

We are going to create a `NumberCollection` class which models either an
`M.StringMap` or an `M.List` to parse JSON like this:

```js
/* eg. 1: */ {"collectionType": "StringMap", "collection": {"a": 1, "b": 2}}
/* eg. 2: */ {"collectionType": "List"     , "collection": [1, 2, 3, 4, 3]}
```

First, we can use `M.Enum` to create `CollectionType`:

```js
const CollectionType = M.Enum.fromObject({
  StringMap: { impl: M.StringMap },
  List: { impl: M.List }
})
```

_Note: `impl` is not a special keyword, but a regular property that you can
name however you prefer._

Now, we are going to write a reviver to deserialise the JSON:

```js
const { number } = M.metadata()

const reviver = (k, v) => {
  // JSON.parse revivers are called for each key-value pair from the
  // bottom-up, so we are going to wait until we are at the root of the JSON
  // to do our processing
  if (k !== '') {
    return v
  }

  const collectionType = M.fromJS(CollectionType, v.collectionType)
  const collection = M.genericsFromJS(collectionType.impl, [number()], v.collection)

  return new NumberCollection(collectionType, collection)
}
```

_Learn more: [Using the reviver parameter in JSON.parse()](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter)_

Finally, we can create our `NumberCollection` class:

```js
class NumberCollection extends M.Base {
  constructor (collectionType, collection) {
    super(NumberCollection, { collectionType, collection })
  }

  getNumbers () {
    const { collectionType, collection } = M.fields(this)

    switch (collectionType) {
      case CollectionType.StringMap():
        return [...collection[M.symbols.innerOrigSymbol].values()]
      case CollectionType.List():
        return [...collection]
      default:
        throw TypeError(`Unknown NumberCollection type ${collectionType.toJSON()}`)
    }
  }

  sum () {
    return this.getNumbers().reduce((acc, x) => acc + x, 0)
  }

  // Since we are reviving the JSON ourselves, it isn't useful to declare
  // inner types
  static innerTypes () {
    return Object.freeze({})
  }

  static metadata () {
    return Object.freeze({ type: NumberCollection, reviver })
  }
}
```

We can now use it as follows:

```js
col1 = M.fromJSON(NumberCollection, `
  {
    "collectionType": "StringMap",
    "collection": {"a": 10, "b": 25, "c": 4000}
  }
`)

col1.sum() // => 4035
```

```js
col2 = M.fromJSON(NumberCollection, `
  {
    "collectionType": "List",
    "collection": [1, 2, 3, 4, 3]
  }
`)

col2.sum() // => 13
```

In this case, the serialisation side of things will work out of the box, since
`M.List`, `M.StringMap` and our `CollectionType` implemented with an `M.Enum`,
implement `.toJSON()` methods on their instances:

```js
JSON.stringify(col1)
// => {"collectionType":"StringMap","collection":{"a":10,"b":25,"c":4000}}

JSON.stringify(col2)
// => {"collectionType":"List","collection":[1,2,3,4,3]}
```
