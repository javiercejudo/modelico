# modelico

[![Build Status](https://travis-ci.org/javiercejudo/modelico.svg)](https://travis-ci.org/javiercejudo/modelico)
[![Coverage Status](https://coveralls.io/repos/javiercejudo/modelico/badge.svg?branch=master)](https://coveralls.io/r/javiercejudo/modelico?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/modelico/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/modelico)

Serialisable model classes

## Install

    npm i modelico

## Usage

### Creating models

```js
const Modelico = require('modelico').Modelico;

class SerialisableDate extends Modelico {
  constructor(fields) {
    super(SerialisableDate, fields);
  }

  toJSON() {
    return JSON.stringify(this.date);
  }

  static reviver(k, v) {
    return new SerialisableDate({date: new Date(v)});
  }
}

class Person extends Modelico {
  constructor(fields) {
    super(Person, fields);
  }

  static get types() {
    return {
      'birthday': SerialisableDate
    };
  }

  fullName() {
    return [
      this.givenName,
      this.familyName
    ].filter(x => x !== null && x !== undefined).join(' ');
  }

  static reviver(k, v) {
    return super.reviver(Person, k, v);
  }
}
```

### Creating instances from JSON

```js
{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z"}
```

```js
const author = JSON.parse(personJson, Person.reviver);

author.fullName(); //=> 'Javier Cejudo'
author.birthday.date.getFullYear(); //=> 1988
```

See [spec](test/spec.js).
