# modélico

**\[moˈðe.li.ko\]** ([IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet))

Universal-JS library for serialisable immutable models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

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
const pet1 = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

pet1.speak(); //=> 'my name is Robbie!'

// pet1 will not be mutated
const pet2 = pet1.set('name', 'Bane');

pet2.name(); //=> 'Bane'
pet1.name(); //=> 'Robbie'
```

Here is how `Animal` would look like:

```js
const M = require('modelico');
const Modelico = M.Modelico;

class Animal extends Modelico {
  constructor(fields) {
    super(Animal, fields);
  }

  speak() {
    const name = this.fields().name;
    return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
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
const person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

person1.fullName(); //=> 'Javier Cejudo'
person1.pets().innerList()[0].speak(); //=> 'my name is Robbie!'
```

*Note: pets() returns a `Modelico.List`, hence the need to call `innerList`
to grab the underlying array. See the [proxies section](#es2015-proxies)
for a way to use methods and properties of the inner structure directly.*

We are going to need a `Person` class much like the `Animal`
class we have already defined. Since `Person` contains a list
of `Animal`, we use the static method `innerTypes` to specify
that.

```js
const M = require('modelico');
const Modelico = M.Modelico;

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);
  }

  fullName() {
    const fields = this.fields();
    return [fields.givenName, fields.familyName].join(' ').trim();
  }

  static innerTypes() {
    return Object.freeze({
      givenName: M.AsIs(String),  // can be omitted since it is a string
      familyName: M.AsIs(String), // can be omitted since it is a string
      pets: M.List.metadata(Modelico.metadata(Animal))
    });
  }
}
```

## A note on immutability

Following the examples above:

```js
const person2 = person1.set('givenName', 'Javi');

// person2 is a clone of person with the givenName
// set to 'Javi', but person is not mutated
person2.fullName(); //=> 'Javi Cejudo'
person1.fullName(); //=> 'Javier Cejudo'

const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

person3.pets().innerList()[0].name(); //=> 'Bane'
person1.pets().innerList()[0].name(); //=> 'Robbie'
```

The same principle applies across all Modélico classes:

```js
// While person.pets().innerList() is a plain array,
// we can shift to grab the first item without
// modifying the internal list, as we are really
// getting a clone of it
person1.pets().innerList().shift().speak(); //=> 'My name is Robbie!'

// When called again, the list is still intact
person1.pets().innerList().shift().speak(); //=> 'My name is Robbie!'
```

## ES2015 proxies

Built-in types in Modélico (List, Set, Map, EnumMap and Date)
are wrappers around native structures. By default, it is necessary to
retrieve those structures to access their properties and methods
(eg. `list.innerList().length`).

However, if your environment
[supports ES2015 proxies](https://kangax.github.io/compat-table/es6/#test-Proxy),
Modélico provides utilities to get around this:

```js
const M = Modelico;
const p = M.proxyMap;

const defaultMap = M.Map.fromObject({a: 1, b: 2, c: 3});
const proxiedMap = p(defaultMap);

// without proxies
defaultMap.innerMap().get('b'); //=> 2
defaultMap.innerMap().size; //=> 3

// with proxies
proxiedMap.get('b'); //=> 2
proxiedMap.size; //=> 3
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
function Animal(fields) {
  Modelico.factory(Animal, fields, this);
}

Animal.prototype = Object.create(Modelico.prototype);
Animal.prototype.constructor = Animal;

Animal.prototype.speak = function() {
  var name = this.fields().name;
  return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
};
```

## Acknowledgments :bow:

Inspired by [Immutable.js](https://github.com/facebook/immutable-js),
[Gson](https://github.com/google/gson) and initially designed to cover
the same use cases as an internal Skiddoo tool by
[Jaie Wilson](https://github.com/jaiew).
