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

See the [nested types example](/docs/basics/nested_types_example.md) to learn more.
