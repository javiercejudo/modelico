# modelico

Universal library for serialisable immutable models.

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg?branch=master)](https://travis-ci.org/javiercejudo/modelico)
[![codecov.io](https://codecov.io/github/javiercejudo/modelico/coverage.svg?branch=master)](https://codecov.io/github/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/modelico.svg)](https://saucelabs.com/u/modelico)

*Note: [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) might be required
for browsers other than Chrome, Firefox and Edge. See [browser tests](test/browser)
for more details or [run the current tests directly on your browser](https://rawgit.com/javiercejudo/modelico/master/test/browser/index.html).*

## Installation

    npm i modelico

To use it on the browser, grab the [minified](dist/modelico.min.js) or the
[development](dist/modelico.js) files.

## Tutorial

The goal is to parse JSON like the following into JavaScript classes

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

so that we can do things like this:

```js
// imagine the JSON above is in `personJson`

const M = Modelico;
const Modelico = M.Modelico;

const person = Modelico.fromJSON(Person, personJson);

person.fullName(); //=> 'Javier Cejudo'
person.pets().list()[0].speak(); //=> 'my name is Robbie!'
```

Let's see how `Person` looks like:

```js
const M = Modelico;
const Modelico = M.Modelico;
const AsIs = M.AsIs;
const List = M.List;

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);

    // only if Person should not be extensible
    Object.freeze(this);
  }

  fullName() {
    const fields = this.fields();

    return [fields.givenName, fields.familyName].join(' ').trim();
  }

  // we need to declare the types of fields that we want
  // to map to classes
  static subtypes() {
    return Object.freeze({
      // JSON compatible types don't need to be declared
      // 'givenName': AsIs.metadata(String),
      'familyName': AsIs.metadata(String),
      'pets': List.metadata(Animal.metadata())
    });
  }
}
```

and here is `Animal`:

```js
class Animal extends Modelico {
  constructor(fields) {
    super(Animal, fields);
  }

  speak() {
    const name = this.fields().name;

    if (name === undefined) {
      return `I don't have a name`;
    }

    return `My name is ${name}!`;
  }

  // since Animal is going to be used within other
  // classes, we need to give some info about it
  static metadata() {
    return Object.freeze({type: Animal, reviver: Modelico.buildReviver(Animal)});
  }
}
```

### A note on immutability

Following the examples above:

```js
// person2 is a clone of person with the givenName
// set to 'Javi', but person is not mutated
const person2 = person.set('givenName', 'Javi');

person2.fullName(); //=> 'Javi Cejudo'
person.fullName(); //=> 'Javier Cejudo'
```

The same principle applies accross all Modelico classes:

```js
// While person.pets().list() is a plain array,
// we can shift to grab the first item without
// modifying the internal list, as we are really
// getting a clone of it:
person.pets().list().shift().speak(); //=> 'My name is Robbie!'

// So when called again, the list is still intact
person.pets().list().shift().speak(); //=> 'My name is Robbie!'
```

See [spec](test).
