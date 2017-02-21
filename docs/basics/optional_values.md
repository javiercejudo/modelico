# Optional / null values

By design, all fields are required, ie. `null` or missing fields will cause a
`TypeError` while reviving. In the case of the `Animal` class from the
[introductory example](../introduction/README.md):

```js
const pet = M.fromJSON(Animal, '{"name": null}')
// => TypeError: no value for key "name"
```

To support missing properties or `null` values, you can either use
`withDefault` or declare the property as a `Maybe`

## Using `withDefault`

The `withDefault` metadata takes some metadata and a default value which will
be used only if the property is `null` or missing.

```js
import M from 'modelico'
const { string, maybe } = M.metadata()

class Animal extends M.Base {

  // ... same as before

  static innerTypes () {
    return Object.freeze({
      name: withDefault(string(), 'Unknown')
    })
  }
}
```

Then, it can be used normally:

```js
const pet1 = M.fromJSON(Animal, '{"name": "Bane"}')
const pet2 = M.fromJSON(Animal, '{"name": null}')
const pet3 = M.fromJSON(Animal, '{}')

pet1.name() // => Bane
pet2.name() // => Unknown
pet3.name() // => Unknown
```

## Maybes

```js
import M from 'modelico'
const { string, maybe } = M.metadata()

class Animal extends M.Base {

  // ... same as before

  static innerTypes () {
    return Object.freeze({
      name: maybe(string())
    })
  }
}
```

Then, we can use it as follows:

```js
// both behave the same way
const pet1 = M.fromJSON(Animal, '{"name": null}')
const pet2 = M.fromJSON(Animal, '{}')

pet1.name().isEmpty()         // => true
pet1.name().getOrElse('Bane') // => Bane
JSON.stringify(pet1)          // => {"name":null}

pet2.name().isEmpty()         // => true
pet2.name().getOrElse('Bane') // => Bane
JSON.stringify(pet2)          // => {"name":null}
```

_Note: `pet2` does not produce the same JSON it was parsed from. If that is
important to you, one possibility would be to not declare the `name` field and
use `M.fields(pet2).name` to check for its presence and value manually._
