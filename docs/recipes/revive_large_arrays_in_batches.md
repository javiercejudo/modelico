# Reviving large arrays in batches

Reviving large objects can block the main thread for too long. In the browser,
for example, this might cause the page to be unresponsive for a noticeable
period of time.

This recipe defines a strategy for reviving large arrays in batches, so that
other work can be interleaved. Inevitably, the total time that it will take to
revive the array will increase, but the page will remain responsive.

Please note that the following applies to the reviving phase done by Modélico,
not the parsing of JSON strings into plain JS objects.

We will use the following object with information about a `Library` that
includes a large catalogue of `Book` items:

```js
const libraryObj = {
  name: 'State Library of NSW',
  established: 1826,
  website: 'http://www.sl.nsw.gov.au/',
  catalogue: [/* large array */]
}
```

The idea is to revive a version of the library with an empty catalogue and
revive the catalogue in batches.

Instead of doing the following,

```js
const library = M.fromJS(Library, libraryObj)
```

we first revive the library with an empty catalogue:

```js
const libraryWithEmptyCatalogue = M.fromJS(
  Library,
  Object.assign({}, libraryObj, {catalogue: []})
)
```

Then, we are going to use an `asyncMap` function (see implementation below) to
revive the catalogue, which is a `Modelico.List` of `Books`.

```js
asyncMap(
  book => M.fromJS(Book, book),
  libraryObj.catalogue,
  { batchSize: 50 }
)
  .then(catalogueArr => {
    const catalogue = M.List.fromArray(catalogueArr)
    const library = libraryWithEmptyCatalogue.copy({catalogue})

    return library
  })
```

### asyncMap(fn, arr, options)

```js
// browsers, except IE and Edge, now have requestIdleCallback,
// while setImmediate exists in Node, IE and Edge;
// setTimeout is included as a last resort for other environments
const schedule = (typeof requestIdleCallback !== 'undefined')
  ? requestIdleCallback
  : (typeof setImmediate !== 'undefined')
  ? setImmediate
  : fn => setTimeout(fn, 0)

const asyncMap = (
  fn,
  arr,
  {batchSize = arr.length} = {}
) => {
  return arr.reduce((acc, _, i) => {
    if (i % batchSize !== 0) {
      return acc
    }

    return acc.then(result =>
      new Promise(resolve => {
        schedule(() => {
          result.push.apply(result, arr.slice(i, i + batchSize).map(fn))
          resolve(result)
        })
      })
    )
  }, Promise.resolve([]))
}
```
