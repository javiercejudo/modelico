[« back to readme](../README.md)

# Nested types example

The [introductory example](../README.md#introduction) features a standalone
class. Let's look at a more involved example that builds on top of that:

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

Again, our goal is to parse JSON into JavaScript classes to be able to do
things like

```js
const person1 = M.fromJSON(Person, personJson);

person1.fullName(); //=> 'Javier Cejudo'
person1.pets().get(0).speak(); //=> 'my name is Robbie!'
```

*Note: pets() returns a `Modelico.List`, which has a `get` method, but little
more. To `map`, `filter` or perform other operations, you will need to grab
the underlying array with `.inner()`. See the
[proxies docs](docs/es2015-proxies) for a way to use methods and properties of
the inner structure directly.*

To achieve our goal, we need a `Person` that references `Animal` within its
inner types using the `M.metadata()._` function.

```js
const M = require('modelico');
const { _, string, list } = M.metadata();

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
