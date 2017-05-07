# Custom serialisation

Borrowing the example from
[Gson's `TypeAdapter`](https://google.github.io/gson/apidocs/com/google/gson/TypeAdapter.html),
we will create a `Point` class that can revive strings like `"5,8"`. Let's see
how the reviver looks like:

```js
const reviver = (k, v) => new Point(...v.split(','))
```

_Note: a third `path` argument is forwarded by the built-in revivers,
mostly to help display more informative error messages when necessary.
`JSON.parse(..., reviver)` would not forward a path as it is not part of the
native API._

With that, we are ready to create our `Point` class:

```js
class Point extends M.Base {
  constructor (x, y) {
    super(Point, { x, y })

    this.x = () => x
    this.y = () => y
  }

  distanceTo (point) {
    const { x: x1, y: y1 } = this
    const { x: x2, y: y2 } = point

    return Math.sqrt((x2() - x1()) ** 2 + (y2() - y1()) ** 2)
  }

  toJSON () {
    return `${this.x()},${this.y()}`
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
// => 1.4142135623730951 = Math.SQRT2 ≈ √2

JSON.stringify(pointB)
// => "3,4"
```
