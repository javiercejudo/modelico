# Quick start

Modélico's goal is to parse JSON strings like

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
const M = require('modelico')

class Animal extends M.createModel(m => ({
  name: m.string()
})) {
  speak() {
    const name = this.name()

    return (name === '') ? `I don't have a name` : `My name is ${name}!`
  }
}
```

The name is required by default. See the
[Optional / null values page](../basics/optional_values.md) to change the
default behaviour.

With a bit more effort, we can have a detailed JSON schema, with the benefits
that they bring, eg. integration with
[JSON Shema Faker](https://github.com/json-schema-faker/json-schema-faker)
to generate random data.

```js
const M = require('modelico')
const Ajv = require('ajv')

class Animal extends M.createAjvModel(new Ajv(), m => ({
  name: m.string({minLength: 1})
})) {
  speak () {
    const name = this.name()

    // the validation is only applied when reviving, not when creating new
    // instances directly (ie. new Animal({name: ''})) does not throw
    return (name === '') ? `I don't have a name` : `My name is ${name}!`
  }
}
```

Now when can do the following to get the schema:

```js
M.getSchema(Animal);
// =>
// {
//   "type": "object",
//   "properties": {
//     "name": {
//       "$ref": "#/definitions/2"
//     }
//   },
//   "required": ["name"],
//   "definitions": {
//     "2": {
//       "type": "string",
//       "minLength": 1
//     }
//   }
// }
```

See the [nested types example](./nested_types_example.md) to
learn more.
