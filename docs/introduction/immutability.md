## A note on immutability

Following the examples above:

```js
const person2 = person1.set('givenName', 'Javi')

// person2 is a clone of person1 with the givenName
// set to 'Javi', but person1 is not mutated
person2.fullName() // => 'Javi Cejudo'
person1.fullName() // => 'Javier Cejudo'

const person3 = person1.setIn(['pets', 0, 'name'], 'Bane')

person3.pets().get(0).name() // => 'Bane'
person1.pets().get(0).name() // => 'Robbie'
```

The same principle applies across all Modélico classes. In the case of
`M.List`, the inner array is frozen. At the time of writing, there is no
canonical way of freezing the other inner structures, so a copy is returned
each time `.inner()` is called.

```js
person1.pets().inner().shift().speak()
// => TypeError: Cannot add/remove sealed array elements
```
