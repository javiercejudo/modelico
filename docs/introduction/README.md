# Introduction

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
const M = require('modelico') // window.Modelico in the browser

class Animal extends M.createModel(m => ({
  name: m.string()
})) {
  constructor (props) {
    super(props, Animal)
  }

  speak () {
    const name = this.name()

    return (name === '')
      ? `I don't have a name`
      : `My name is ${name}!`
  }
}
```

A convenient way to declare the inner types and have access to the metadata
functions is to extend from `M.createModel(...)`:

```js
const M = require('modelico')

class Animal extends M.createModel(m => ({
  name: m.string()
})) {
  constructor (props) {
    super(Animal, props)
  }

  speak () {
    // same as above
  }
}
```

See the [nested types example](/docs/introduction/nested_types_example.md) to learn more.
