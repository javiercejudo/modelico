Modélico \[moˈðe.li.ko\] is a universal-JS library for serialisable immutable
models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)
[![Dependency Status](https://gemnasium.com/badges/github.com/javiercejudo/modelico.svg)](https://gemnasium.com/github.com/javiercejudo/modelico)

[![Build Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

*Note: [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) might be
required for browsers other than Chrome, Firefox and Edge. Additionally, IE 9
and 10 also require a `getPrototypeOf` polyfill as the one in [es5-sham](https://github.com/es-shims/es5-shim#shams).
See [browser tests](test/browser) for more details.*

## How is this different from Modélico?

Modélico models are immutable, but are implemented with native structures, eg.
the normal `M.Map` is implemented with JavaScript's native `Map`, while the `M.Map`
is implemented with `Immutable.OrderedMap`. The same goes for `M.Set` and `M.List`.

## Installation

    npm i modelico-immutable

To use it in the browser, grab the [minified](dist/modelico.min.js) or the
[development](dist/modelico.js) files.

Run the current tests directly on your target browsers to see what setup is
right for you:

- [Run](https://rawgit.com/javiercejudo/modelico/immutable-js/test/browser/index.html) with standard ES5 setup
- [Run](https://rawgit.com/javiercejudo/modelico/immutable-js/test/browser/ie9_10.html) with legacy ES3 setup

## Introduction

The goal is to parse JSON strings like the following into JavaScript custom
objects,

```JSON
{
  "name": "Robbie"
}
```

so that we can do things like this:

```js
const pet1 = M.fromJSON(Animal, petJson);

pet1.speak(); //=> 'my name is Robbie!'

// pet1 is immutable
const pet2 = pet1.set('name', 'Bane');

pet2.name(); //=> 'Bane'
pet1.name(); //=> 'Robbie'
```

`M.fromJSON` is a simpler way to do the following:

```js
const { _ } = M.metadata();
const pet1 = JSON.parse(petJson, _(Animal).reviver);
```

Here is how `Animal` would look like:

```js
const M = require('modelico'); // window.Modelico in the browser
const { string } = M.metadata();

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
} = M.metadata();
```

## A note on immutability

Following the examples above:

```js
const person2 = person1.set('givenName', 'Javi');

// person2 is a clone of person1 with the givenName
// set to 'Javi', but person1 is not mutated
person2.fullName(); //=> 'Javi Cejudo'
person1.fullName(); //=> 'Javier Cejudo'

const person3 = person1.setIn(['pets', 0, 'name'], 'Bane');

person3.pets().get(0).name(); //=> 'Bane'
person1.pets().get(0).name(); //=> 'Robbie'
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
