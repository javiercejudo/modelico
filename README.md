Modélico \[moˈðe.li.ko\] is a universal-JS library for serialisable immutable models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)
[![Dependency Status](https://gemnasium.com/badges/github.com/javiercejudo/modelico.svg)](https://gemnasium.com/github.com/javiercejudo/modelico)

[![Build Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

*Note: [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) might be required
for browsers other than Chrome, Firefox and Edge. Additionally, IE 9 & 10 also require
a `getPrototypeOf` polyfill as the one in [es5-sham](https://github.com/es-shims/es5-shim#shams).
See [browser tests](test/browser) for more details.*

## Installation

    npm i modelico

To use it in the browser, grab the [minified](dist/modelico.min.js) or the
[development](dist/modelico.js) files.

Run the current tests directly on your target browsers to see what setup is right for you:

- [Run](https://rawgit.com/javiercejudo/modelico/master/test/browser/index.html) with standard ES5 setup
- [Run](https://rawgit.com/javiercejudo/modelico/master/test/browser/ie9_10.html) with legacy ES3 setup

## Quick intro

The goal is to parse JSON strings like the following into JavaScript custom objects

```JSON
{
  "name": "Robbie"
}
```

so that we can do things like this:

```js
const pet1 = M.fromJSON(Animal, petJson);

pet1.speak(); //=> 'my name is Robbie!'

// pet1 will not be mutated
const pet2 = pet1.set('name', 'Bane');

pet2.name(); //=> 'Bane'
pet1.name(); //=> 'Robbie'
```

`M.fromJSON` is a simpler way to do the following:

```js
const { _ } = M.metadata;
const pet1 = JSON.parse(petJson, _(Animal).reviver);
```

Here is how `Animal` would look like:

```js
const M = require('modelico');
const { string } = M.metadata;

class Animal extends M.Base {
  constructor(fields) {
    super(Animal, fields);
  }

  speak() {
    const name = this.name();

    return (name === '')
      ? `I don't have a name`
      : `My name is ${name}!`;
  }

  static innerTypes() {
    return Object.freeze({
      name: string()
    });
  }
}
```

## A more complex example

The previous example features a standalone class. Let's look at
a more involved example that builds on top of that:

```JSON
{
  "givenName": "Javier",
  "familyName": "Cejudo",
  "pets": [
    {
      "name": "Robbie"
    }
  ]
}
```

Notice that the data contains a list of pets (`Animal`).

Again, our goal is to parse JSON into JavaScript classes
to be able to do things like

```js
const person1 = M.fromJSON(Person, personJson);

person1.fullName(); //=> 'Javier Cejudo'
person1.pets().inner()[0].speak(); //=> 'my name is Robbie!'
```

*Note: pets() returns a `Modelico.List`, hence the need to use `.inner()`
to grab the underlying array. See the [proxies section](#es2015-proxies)
for a way to use methods and properties of the inner structure directly.*

We are going to need a `Person` class much like the `Animal`
class we have already defined.

```js
const M = require('modelico');
const { _, string, list } = M.metadata;

class Person extends M.Base {
  constructor(fields) {
    super(Person, fields);
  }

  fullName() {
    return [this.givenName(), this.familyName()].join(' ').trim();
  }

  static innerTypes() {
    return Object.freeze({
      givenName: string(),
      familyName: string(),
      pets: list(_(Animal))
    });
  }
}
```

## Types

Here is a list of the built-in immutable types:

- `Enum`: simple enumerated values with optional associated data.
- `Map`: ordered map with arbitrary keys and values.
- `EnumMap`: ordered map with enum keys and arbitrary values.
- `StringMap`: ordered map with string keys and arbitrary values.
- `List`: ordered indexed collection, implemented with plain arrays, but immutable.
- `Set`: ordered collection with no repeated values.
- `Date`: much like a JavaScript date, but immutable.
- `Number`: a number wrapper to support serialisation of `-0` and ±`Infinity` (rarely needed).
- `Maybe`: it helps with optional/nullable fields.

Each of the types above has an associated metadata
function in `M.metadata`, with some useful additions:

```js
{
  _,      // to retrieve the metadata of arbitrary types, eg. _(Animal)
  asIs,   // useful for custom deserialisation, eg: asIs(x => 2 * x) to double numbers in JSON
  any,    // to leave JSON input untouched
  number, // for native numbers, but optionally wraps to support -0 and ±Infinity
          // eg. number({wrap: true})

  string, // remember they are all functions, eg. string(), list(date())
  boolean,
  regExp,
  fn,

  map,
  enumMap,
  stringMap,
  list,
  set,
  date,
  maybe
} = M.metadata;
```

## A note on immutability

Following the examples above:

```js
const person2 = person1.set('givenName', 'Javi');

// person2 is a clone of person with the givenName
// set to 'Javi', but person is not mutated
person2.fullName(); //=> 'Javi Cejudo'
person1.fullName(); //=> 'Javier Cejudo'

const person3 = person1.setIn(['pets', 0, 'name'], 'Bane');

person3.pets().inner()[0].name(); //=> 'Bane'
person1.pets().inner()[0].name(); //=> 'Robbie'
```

The same principle applies across all Modélico classes:

```js
// While person.pets().inner() is a plain array,
// we can shift to grab the first item without
// modifying the internal list, as we are really
// getting a clone of it
person1.pets().inner().shift().speak(); //=> 'My name is Robbie!'

// When called again, the list is still intact
person1.pets().inner().shift().speak(); //=> 'My name is Robbie!'
```

## Optional / null values

In the examples above, a pet with a `null` or missing `name` would cause a
`TypeError` while reviving.

```js
const pet = M.fromJSON(Animal, '{"name": null}');
//=> TypeError: no value for key "name"
```

To support missing properties or `null` values, you can declare the property
as a `Maybe`:

```js
const M = require('modelico');
const { string, maybe } = M.metadata;

class Animal extends M.Base {

  // ... same as before

  static innerTypes() {
    return Object.freeze({
      name: maybe(string())
    });
  }
}
```

Then, we can use it as follows:

```js
const pet = M.fromJSON(Animal, '{"name": null}');

pet.name().isEmpty(); //=> true
pet.name().getOrElse('Bane'); //=> Bane
```

## getIn / setIn

Modélico objects support deeply getting values given a path, and
deeply setting values given a path and a value.

Using the `Person` and `Animal` classes

```js
const { _, string, maybe, list } = M.metadata;

class Person extends M.Base {

  // ... same as before

  static innerTypes() {
    return Object.freeze({
      givenName: string(),
      familyName: string(),
      pets: list(maybe(_(Animal)))
    });
  }
}

class Animal extends M.Base {

  // ... same as before

  static innerTypes() {
    return Object.freeze({
      name: maybe(string())
    });
  }
}
```

Notice that the path items are strings for regular fields
and numbers for `M.List`. `M.Maybe` has its own dedicated
way to account for the case where the value is not present,
consisting of an array with two items: the default value,
and the path item that applies for the inner type.

Getting:

```js
const defaultAnimal = new Animal();

const ownerOfUnnamedPet = new Person({
  givenName: 'Javier',
  familyName: 'Cejudo',
  pets: M.List.of(M.Maybe.of(defaultAnimal))
});

ownerOfUnnamedPet.getIn([
  'pets',
  0,
  [defaultAnimal, 'name'],
  ['Unknown']
]); // => Unknown

// the above is equivalent to:
ownerOfUnnamedPet
  .pets()
  .get(0)
  .getOrElse(defaultAnimal).name()
  .getOrElse('Unknown')
```

Setting:

```js
const ownerOfBane = ownerOfUnnamedPet.setIn([
  'pets',
  0,
  [defaultAnimal, 'name']
], 'Bane');

ownerOfBane.getIn([
  'pets',
  0,
  [defaultAnimal, 'name'],
  ['Unknown']
]); // => Bane
```

## ES2015 proxies

Most built-in types in Modélico (List, Set, Map, EnumMap and Date)
are wrappers around native structures. Except for a few built-in basic
methods, it is necessary to retrieve those structures to access their
properties and methods (eg. `list.inner().reduce`).

However, if your environment
[supports ES2015 proxies](https://kangax.github.io/compat-table/es6/#test-Proxy),
Modélico provides utilities to get around this:

```js
const M = Modelico;
const p = M.proxyMap;

const defaultMap = M.Map.fromObject({a: 1, b: 2, c: 3});
const proxiedMap = p(defaultMap);

// without proxies
defaultMap.inner().keys().next(); //=> { value: "a", done: false }

// with proxies
proxiedMap.keys().next(); //=> { value: "a", done: false }
```

Please note that native methods that modify the structure in place will
instead return a new modelico object:

```js
const proxiedMap2 = proxiedMap.delete('b');

proxiedMap.size;  //=> 3 (still)
proxiedMap2.size; //=> 2
```

See [proxy tests](test/proxies) for more details.

## ES5 classes

To support legacy browsers without transpiling, Modélico can be used
with ES5-style classes. In the case of our `Animal` class:

```js
(function(M) {
  var m = M.metadata;

  function Animal(fields) {
    M.Base.factory(Animal, fields, this);
  }

  Animal.prototype = Object.create(M.Base.prototype);
  Animal.prototype.constructor = Animal;

  Animal.prototype.speak = function() {
    var name = this.name();

    return (name === '')
      ? "I don't have a name"
      : 'My name is ' + name + '!';
  };

  Animal.innerTypes = function() {
    return Object.freeze({
      name: m.string()
    });
  }
}(window.Modelico));
```

## Acknowledgments :bow:

Inspired by [Immutable.js](https://github.com/facebook/immutable-js),
[Gson](https://github.com/google/gson) and initially designed to cover
the same use cases as an internal Skiddoo tool by
[Jaie Wilson](https://github.com/jaiew).
