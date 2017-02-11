# Deep operations

Modélico objects support deeply getting values given a path, and
deeply setting values given a path and a value.

Using the `Animal` and `Person` classes used in the
[introductory example](../README.md#introduction) and the
[nested types example](nested_types_example.md)

## `getIn`

```js
const defaultAnimal = new Animal()

const ownerOfUnnamedPet = new Person({
  givenName: 'Javier',
  familyName: 'Cejudo',
  pets: M.List.of(M.Maybe.of(defaultAnimal))
})

ownerOfUnnamedPet.getIn([
  'pets',                  // String for regular fields
  0,                       // Numbers for M.List
  [defaultAnimal, 'name'], // A pair of default and path item for M.Maybe
  ['Unknown']              // Same as above, but only the default name is
])                         // required as we aren't going deeper
// => Unknown
```

Notice that the path items are strings for regular fields and
numbers for `M.List`. There is another dedicated way for `M.Maybe` for the
case where the value is not present, consisting of an array with two items:
the default value, and the path item that applies for the inner type.

The above is equivalent to

```js
ownerOfUnnamedPet
  .pets()
  .get(0)
  .getOrElse(defaultAnimal).name()
  .getOrElse('Unknown')
  // => Unknown
```

## `setIn`

To set values deeply, a very similar approach is used:

```js
const ownerOfBane = ownerOfUnnamedPet.setIn([
  'pets',
  0,
  [defaultAnimal, 'name']
], 'Bane')

ownerOfBane.getIn([
  'pets',
  0,
  [defaultAnimal, 'name'],
  ['Unknown']
])
// => Bane
```
