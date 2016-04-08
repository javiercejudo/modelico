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

To use it in the browser, grab the [minified](dist/modelico.min.js) or the
[development](dist/modelico.js) files.

## Quick intro

The goal is to parse JSON strings like the following into JavaScript classes

```JSON
{
  "name": "Robbie"
}
```

so that we can do things like this:

```js
const pet = JSON.parse(petJson, Modelico.buildReviver(Animal));

pet.speak(); //=> 'my name is Robbie!'
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
const person = JSON.parse(personJson, Modelico.buildReviver(Person));

person.fullName(); //=> 'Javier Cejudo'
person.pets().list()[0].speak(); //=> 'my name is Robbie!'
```

We are going to need a `Person` class much like the `Animal`
class we have already defined. Since `Person` contains a list
of `Animal`, we use the static method `innerTypes` to specify
that.

```js
const M = require('modelico');
const Modelico = M.Modelico;
const AsIs = M.AsIs;
const List = M.List;

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
      'givenName': AsIs.metadata(String),  // can be omitted since it is a string
      'familyName': AsIs.metadata(String), // can be omitted since it is a string
      'pets': List.metadata(Animal.metadata())
    });
  }
}
```

Finally `Animal` needs to be updated to add a `metadata` static
method to help its parsing when used within other classes:

```js
class Animal extends Modelico {
  // ... constructor and speak methods shown above

  static metadata() {
    return Object.freeze({type: Animal, reviver: Modelico.buildReviver(Animal)});
  }
}
```

## A note on immutability

Following the examples above:

```js
const person2 = person.set('givenName', 'Javi');

// person2 is a clone of person with the givenName
// set to 'Javi', but person is not mutated
person2.fullName(); //=> 'Javi Cejudo'
person.fullName();  //=> 'Javier Cejudo'
```

The same principle applies across all Modelico classes:

```js
// While person.pets().list() is a plain array,
// we can shift to grab the first item without
// modifying the internal list, as we are really
// getting a clone of it
person.pets().list().shift().speak(); //=> 'My name is Robbie!'

// When called again, the list is still intact
person.pets().list().shift().speak(); //=> 'My name is Robbie!'
```

## ES5 classes

To support legacy browsers without transpiling, Modelico can be used
with ES5-style classes. In the case of our `Animal` class:

```js
function Animal(fields) {
  // Object.assign is ES6, but can be polyfilled
  Object.assign(this, new Modelico(Animal, fields));
}

Animal.prototype = Object.create(Modelico.prototype);

Animal.prototype.speak = function() {
  var name = this.fields().name;
  return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
};

Animal.metadata = function() {
  return Object.freeze({type: Animal, reviver: Modelico.buildReviver(Animal)});
};
```

See [spec](test).
