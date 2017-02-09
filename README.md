Modélico \[moˈðe.li.ko\] is a universal-JS library for serialisable immutable
models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)
[![Dependency Status](https://gemnasium.com/badges/github.com/javiercejudo/modelico.svg)](https://gemnasium.com/github.com/javiercejudo/modelico)

[![Build Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

*Note: [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) might be
required for browsers other than Chrome, Firefox and Edge.
See [browser tests](test/browser) for more details.*

## Installation

    npm i modelico

To use it in the browser, grab the [minified](dist/modelico.min.js) or the
[development](dist/modelico.js) files.

[Run the current tests](https://rawgit.com/javiercejudo/modelico/master/test/browser/index.html)
directly on your target browsers to make sure things work as expected.

## Introduction

The goal is to parse JSON strings like

```JSON
{
  "name": "Robbie"
}
```

into JavaScript custom objects so that we can do things like this:

```js
const myPet = M.fromJSON(Animal, petJson)

myPet.speak() // => 'my name is Robbie!'
```

Here is how `Animal` would look like:

```js
const M = require('modelico') // window.Modelico in the browser
const { string } = M.metadata()

class Animal extends M.Base {
  constructor (props) {
    super(Animal, props)
  }

  speak () {
    const name = this.name()

    return (name === '')
      ? `I don't have a name`
      : `My name is ${name}!`
  }

  static innerTypes () {
    return Object.freeze({
      name: string()
    })
  }
}
```

See the [nested types example](docs/nested_types_example.md) to learn more.

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

### Metadata

Each of the types above has an associated metadata
function in `M.metadata()`, with some useful additions:

```js
const {
  _,           // to retrieve the metadata of arbitrary types, eg. _(Animal)
  asIs,        // useful for custom deserialisation, eg: asIs(x => 2 * x) to double numbers in JSON
  any,         // to leave JSON input untouched
  maybe,       // to declare a value as optional
  withDefault, // to set a default if the value is missing
  number,      // for native numbers, but optionally wraps to support -0 and ±Infinity
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
  date
} = M.metadata()
```

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

## Learn more

- [Nested types example](docs/nested_types_example.md)
- [Optional / null values](docs/optional_values.md)
- [Deep operations: getIn and setIn](docs/deep_operations.md)
- [Custom serialisation](docs/custom_serialisation.md)
- [Reviving polymorphic JSON](docs/reviving_polymorphic_json.md)
- [JSON validation](docs/json_validation.md)
- [Proxies: accessing inner methods directly](docs/proxies.md)
- [ES5: write for all browsers without transpiling](docs/es5.md)

## Acknowledgments :bow:

Inspired by [Immutable.js](https://github.com/facebook/immutable-js),
[Gson](https://github.com/google/gson) and initially designed to cover
the same use cases as an internal Skiddoo tool by
[Jaie Wilson](https://github.com/jaiew).
