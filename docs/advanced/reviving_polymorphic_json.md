# Reviving polymorphic JSON

The [built-in metadata](../introduction/metadata.md) covers the bulk of use cases.
However, to deal with types whose JSON might take more than one form, you will
need a custom reviving strategy. We are going to walk through two examples:
first, we will revive objects based on an enumerated field that will indicate
how the object should be revived; second, we will revive objects based on
their shape only, without any additional fields.

## Example 1: revive based on an enumerated field

We are going to create a `NumberCollection` class which models either an
`M.StringMap` or an `M.List` to parse JSON like this:

```js
/* eg. 1: */ {"collectionType": "OBJECT", "collection": {"a": 1, "b": 2}}
/* eg. 2: */ {"collectionType": "ARRAY" , "collection": [1, 2, 3, 4, 3]}
```

_Note: the convention is to name the type field as simply `type`, but we will
continue with `collectionType` to show that it is up to you._

First, we can use `M.Enum` to create `CollectionType`:

```js
const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY'])
```

Now, we can create our `NumberCollection` class:

```js
const { _, number, stringMap, list, anyOf } = M.metadata()

class NumberCollection extends M.Base {
  constructor (props) {
    super(NumberCollection, props)
  }

  getNumbers () {
    const { collectionType, collection } = this

    switch (collectionType()) {
      case CollectionType.OBJECT():
        // Note that .inner() creates a copy. For improved performance,
        // [...collection()[M.symbols.innerOrigSymbol]().values()]
        // could be used
        return [...collection().inner().values()]
      case CollectionType.ARRAY():
        return [...collection()]
      default:
        throw TypeError(`Unsupported NumberCollection with type ${collectionType.toJSON()}`)
    }
  }

  sum () {
    return this.getNumbers().reduce((acc, x) => acc + x, 0)
  }

  static innerTypes () {
    return Object.freeze({
      collectionType: _(CollectionType),
      collection: anyOf([
        [stringMap(number()), CollectionType.OBJECT()],
        [list(number()), CollectionType.ARRAY()]
      ], 'collectionType') // if omitted, the enumerated field is 'type'
    })
  }
}
```

Note that the value for each field in `innerTypes` can be either metadata or
a metadata-returning function that will be passed the plain object being
revived.

We can now use it as follows:

```js
const col1 = M.fromJSON(NumberCollection, `
  {
    "collectionType": "OBJECT",
    "collection": {"a": 10, "b": 25, "c": 4000}
  }
`)

col1.sum() // => 4035
```

```js
const col2 = M.fromJSON(NumberCollection, `
  {
    "collectionType": "ARRAY",
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

## Example 2: revive based on the shape of the value

First, it is worth mentioning this is not always possible, as the shape of the
JSON representation might be ambiguous (see example in
[Gson's RuntimeTypeAdapterFactory](https://github.com/google/gson/blob/9e6f2bab20257b6823a5b753739f047d79e9dcbd/extras/src/main/java/com/google/gson/typeadapters/RuntimeTypeAdapterFactory.java#L36)).

In this example, we are going to revive the same polymorphic JSON as the one
above, but without an enumerated field to hint the type of the collection.

```js
const { number, stringMap, list } = M.metadata()

class NumberCollection extends M.Base {
  constructor (props) {
    super(NumberCollection, props)
  }

  getNumbers () {
    const collection = this.collection()

    return (collection[M.symbols.typeSymbol]() === M.List)
      ? [...collection]
      : [...collection[M.symbols.innerOrigSymbol]().values()]
  }

  sum () {
    return this.getNumbers().reduce((acc, x) => acc + x, 0)
  }

  static innerTypes () {
    return Object.freeze({
      collection: v => Array.isArray(v.collection)
        ? list(number())
        : stringMap(number())
    })
  }
}
```

The end result is simpler, but less generic. It might require non-trivial
updates to the logic that figures out which metadata to use. For example,
if we start supporting `map(number())`, whose JSON representation is an
array of pairs, `Array.isArray` will not be enough.
