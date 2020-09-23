# Types

Here is a list of the built-in immutable types:

### Number

A number wrapper to support serialisation of `-0`, `NaN` and ±`Infinity`
(rarely needed).

Examples:
```js
new M.Number(0)
M.Number.of(5)
M.Number.of(NaN)
M.Number.of(-Infinity)
```

### Date

Much like a JavaScript date, but immutable.

Examples:
```js
new M.Date()
new M.Date(new Date(1978, 11, 6))
M.Date.of()
M.Date.of(new Date(1978, 11, 6))
```

### Enum

Simple enumerated values with optional associated data.

Examples:
```js
new M.Enum(['SUN', 'MOON'])
new M.Enum({'SUN': {radius: 695700}, 'MOON': {radius: 1737.1}})
M.Enum.fromArray(['SUN', 'MOON'])
M.Enum.fromObject({'SUN': {radius: 695700}, 'MOON': {radius: 1737.1}})
```

### Map

Ordered map with arbitrary keys and values.

Examples:
```js
new M.Map(new Map([[1, 'a'], [2, 'b']]))
M.Map.fromMap(new Map([[1, 'a'], [2, 'b']]))
M.Map.fromArray([[1, 'a'], [2, 'b']])
M.Map.fromObject({1: 'a', 2: 'b'}) // 1 and 2 are strings in this case
M.Map.of(1, 'a', 2, 'b')
```

### EnumMap

Ordered map with enum keys and arbitrary values.

Examples:
```js
const SolarSystem = M.Enum.fromArray(['SUN', 'MOON'])
const SUN = SolarSystem.SUN()
const MOON = SolarSystem.MOON()

new M.EnumMap(new Map([[SUN, 1], [MOON, 2]]))
M.EnumMap.fromMap(new Map([[SUN, 1], [MOON, 2]]))
M.EnumMap.fromArray([[SUN, 1], [MOON, 2]])
M.EnumMap.of(SUN, 1, MOON, 2)
```

### StringMap

Ordered map with string keys and arbitrary values.

Examples:
```js
new M.StringMap(new Map([['a', 1], ['b', 2]]))
M.StringMap.fromMap(new Map([['a', 1], ['b', 2]]))
M.StringMap.fromArray([['a', 1], ['b', 2]])
M.StringMap.fromObject({a: 1, b: 2})
M.StringMap.of('a', 1, 'b', 2)
```

### List

Ordered indexed collection, implemented with plain arrays, but immutable.

Examples:
```js
new M.List([1, 5, 3, 5])
M.List.fromArray([1, 5, 3, 5])
M.List.of(1, 5, 3, 5)
```

### Set

Ordered collection with no repeated values.

```js
new M.Set([1, 5, 3])
M.Set.fromArray([1, 5, 3])
M.Set.of(1, 5, 3)
```

### Maybe

It helps with optional/nullable fields. See
[Optional / null values: Maybes](../basics/optional_values.md#maybes) for more
details.

```js
M.Nothing.isEmpty()         // => true
new M.Maybe(null).isEmpty() // => true
M.Maybe.of(null).isEmpty()  // => true

new M.Just(2).isEmpty()   // => false
M.Just.of(2).isEmpty()    // => false
M.Maybe.of(2).isEmpty()   // => false
M.Just.of(null).isEmpty() // => false (can wrap anything)

M.Just.of(2).map(x => 2 * x)        // => M.Just.of(4)
M.Nothing.map(x => 2 * x).isEmpty() // => true
```
