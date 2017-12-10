# Runtime type for subclasses

This recipe is useful when you need to revive fields where several subclasses
can appear.

An example of this is JSON generated using
[Gson's `TypeAdapter`](https://google.github.io/gson/apidocs/com/google/gson/TypeAdapter.html).
In fact, this example is based on [Gson's RuntimeTypeAdapterFactory](https://github.com/google/gson/blob/gson-parent-2.8.0/extras/src/main/java/com/google/gson/typeadapters/RuntimeTypeAdapterFactory.java#L36)

We will use
[`ajvMetadata`](../advanced/json_validation.md#majvmetadata-and-json-schema)
to demonstrate how to get Modélico to generate complex JSON schemas. This is
also an example of a schema with circular references.

```js
class Geometer extends M.Base {
  static innerTypes () {
    return Object.freeze({
      name: string({minLength: 1}),
      // Shape has multiple subclasses
      favouriteShape: _(Shape)
    })
  }
}
```

The `Shape` in the inner types can be either a `Diamond` or a `Circle`. Let's
look at their definitions:

```js
const ShapeType = M.Enum.fromArray(['CIRCLE', 'DIAMOND'])

// We are going to use this metadata in several places, so by reusing it, we
// not only save unnecessary processing, but our generated JSON schema will
// also be more compact.
const greaterThanZero = number({
  exclusiveMinimum: 0
})

const reviver = (k, v) => {
  if (k !== '') {
    return v
  }

  switch (v.type) {
    case ShapeType.CIRCLE().toJSON():
      return new Circle(v)
    case ShapeType.DIAMOND().toJSON():
      return new Diamond(v)
    default:
      throw TypeError('Unsupported or missing shape type in the Shape reviver.')
  }
}

class Shape extends M.Base {
  toJSON () {
    const fields = M.fields(this)
    let type

    // the generated JSON must contain runtime type information for Modélico
    // to be able to revive it later
    switch (this[M.symbols.typeSymbol]()) {
      case Circle:
        type = ShapeType.CIRCLE()
        break
      case Diamond:
        type = ShapeType.DIAMOND()
        break
      default:
        throw TypeError('Unsupported Shape in the toJSON method.')
    }

    return Object.freeze(Object.assign({type}, fields))
  }

  static innerTypes () {
    return Object.freeze({
      // notice the self-reference here and how the subclasses are
      // going to extend Shape's inner types
      relatedShape: maybe(_(Shape))
    })
  }

  static metadata () {
    // We are going to use meta so that M.getSchema can give us a more
    // robust JSON schema. If you don't need that, you could return the
    // baseMetadata directly.
    const baseMetadata = Object.assign({}, base(Shape), {reviver})

    return meta(baseMetadata, {}, {}, () => ({
      anyOf: [
        Circle,
        Diamond
      ].map(x => M.getSchema(base(x), false))
    }))
  }
}
```

```js
class Circle extends Shape {
  constructor (props) {
    super(Circle, props)
  }

  area () {
    return Math.PI * this.radius() ** 2
  }

  static innerTypes () {
    return Object.freeze(Object.assign({}, super.innerTypes(), {
      radius: greaterThanZero
    }))
  }
}
```

```js
class Diamond extends Shape {
  constructor (props) {
    super(Diamond, props)
  }

  area () {
    return this.width() * this.height() / 2
  }

  static innerTypes () {
    return Object.freeze(Object.assign({}, super.innerTypes(), {
      width: greaterThanZero
      height: greaterThanZero
    }))
  }
}
```

With that, we can revive `Diamond`s

```js
const geometer1 = M.fromJS(Geometer, {
  name: 'Audrey',
  favouriteShape: {
    type: 'DIAMOND',
    width: 8,
    height: 7
  }
})

geometer1.favouriteShape().area() // => 28
```

as well as `Circle`s:

```js
const geometer2 = M.fromJS(Geometer, {
  name: 'Javier',
  favouriteShape: {
    type: 'CIRCLE',
    radius: 3
  }
})

geometer2.favouriteShape().area() // => Math.PI * 3 ** 2
```

Serialisation also works for `Diamond`s and `Circle`s

```js
geometer1.toJS()
geometer2.toJS()
```

respectively yield:

```js
{
  name: 'Audrey',
  favouriteShape: {
    type: 'DIAMOND',
    relatedShape: null,
    width: 8,
    height: 7
  }
}
```

```js
{
  name: 'Javier',
  favouriteShape: {
    type: 'CIRCLE',
    relatedShape: null,
    radius: 3
  }
}
```

Now remember how we have been using `ajvMetadata` and even enhanced the Shape
metadata to account for its subtypes. This is going to allow us to get a very
detailed schema that would not be easy to write by hand.

_Note: definitions are sequentially named to avoid collisions. In the example
below, the definition numbers have gaps because some of them got reserved in
case they'd be reused. Short sub-schemas (less than 2 keys and not arrays) are
always inlined._

```js
M.getSchema(_(Geometer))
```

yields:

```js
{
  type: 'object',
  properties: {
    name: {
      $ref: '#/definitions/2'
    },
    favouriteShape: {
      $ref: '#/definitions/3'
    }
  },
  required: ['name', 'favouriteShape'],
  definitions: {
    '2': {
      type: 'string',
      minLength: 1
    },
    '3': {
      anyOf: [
        {
          $ref: '#/definitions/4'
        },
        {
          $ref: '#/definitions/7'
        }
      ]
    },
    '4': {
      type: 'object',
      properties: {
        relatedShape: {
          $ref: '#/definitions/5'
        },
        radius: {
          $ref: '#/definitions/6'
        }
      },
      required: ['radius']
    },
    '5': {
      anyOf: [
        {
          type: 'null'
        },
        {
          $ref: '#/definitions/3'
        }
      ]
    },
    '6': {
      type: 'number',
      exclusiveMinimum: 0
    },
    '7': {
      type: 'object',
      properties: {
        relatedShape: {
          $ref: '#/definitions/5'
        },
        width: {
          $ref: '#/definitions/6'
        },
        height: {
          $ref: '#/definitions/6'
        }
      },
      required: ['width', 'height']
    }
  }
}
```
