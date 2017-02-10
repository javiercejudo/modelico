# ES5 classes

To support legacy browsers without transpiling, Modélico can be used
with ES5-style classes. In the case of the `Animal` class from the
[introductory example](../README.md#introduction):

```js
(function (M) {
  var m = M.metadata()

  function Animal (fields) {
    M.Base.factory(Animal, fields, this)
  }

  Animal.prototype = Object.create(M.Base.prototype)
  Animal.prototype.constructor = Animal

  Animal.prototype.speak = function () {
    var name = this.name()

    return (name === '')
      ? "I don't have a name"
      : 'My name is ' + name + '!'
  }

  Animal.innerTypes = function () {
    return Object.freeze({
      name: m.string()
    })
  }
}(window.Modelico))
```
