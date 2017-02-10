# Custom serialisation

Borrowing the example from
[Gson's `TypeAdapter`](https://google.github.io/gson/apidocs/com/google/gson/TypeAdapter.html),
we will create a `Point` class that can revive strings like `"5,8"`. Let's see
how the reviver looks like:

```js
const reviver = (k, v, path = []) => {
  const [x, y] = v.split(',')

  return new Point(x, y)
}
```

_Note: the additional `path` argument forwarded by the built-in revivers is
mostly to help display more informative error messages when necessary.
`JSON.parse(..., reviver)` would not forward a path as it is not part of the
native API._

With that, we are ready to create our `Point` class:

```js
class Point extends M.Base {
  constructor (x, y) {
    super(Point, { x, y })
  }

  distanceTo (point) {
    const { x: x1, y: y1 } = M.fields(this)
    const { x: x2, y: y2 } = M.fields(point)

    return Math.sqrt(
      ((x2 - x1) ** 2) +
      ((y2 - y1) ** 2)
    )
  }

  toJSON () {
    const { x, y } = M.fields(this)

    return `${x},${y}`
  }

  static innerTypes () {
    return Object.freeze({})
  }

  static metadata () {
    return Object.freeze({ type: Point, reviver })
  }
}
```

We can now use it as follows:

```js
const pointA = M.fromJSON(Point, '"2,3"')
const pointB = new Point(3, 4)

pointA.distanceTo(pointB)
// => 1.4142135623730951 ≈ √2

JSON.stringify(pointB)
// => "3,4"
```
