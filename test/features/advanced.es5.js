/* eslint-env mocha */

export default (should, M) => () => {
  // use ES5 below
  var m = M.metadata

  function Animal (fields) {
    M.Base.factory(Animal, fields, this)
  }

  Animal.prototype = Object.create(M.Base.prototype)

  Animal.prototype.speak = function () {
    var name = this.name().getOrElse('')

    return (name === '')
      ? "I don't have a name"
      : 'My name is ' + name + '!'
  }

  Animal.innerTypes = function () {
    return Object.freeze({
      name: m.maybe(m.string())
    })
  }

  function Person (fields) {
    M.Base.factory(Person, fields, this)
  }

  Person.prototype = Object.create(M.Base.prototype)

  Person.prototype.fullName = function () {
    return [this.givenName(), this.familyName()].join(' ').trim()
  }

  Person.innerTypes = function () {
    return Object.freeze({
      givenName: m.string(),
      familyName: m.string(),
      pets: m.list(m.maybe(m._(Animal)))
    })
  }

  // use > ES5 below
  it('should showcase the main features', () => {
    const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [
        {
          "name": "Robbie"
        },
        null
      ]
    }`

    const person1 = JSON.parse(personJson, m._(Person).reviver)

    person1.fullName().should.be.exactly('Javier Cejudo')

    const person2 = person1.set('givenName', 'Javi')
    person2.fullName().should.be.exactly('Javi Cejudo')
    person1.fullName().should.be.exactly('Javier Cejudo')

    const defaultAnimal = new Animal()

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!')

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!')

    const person3 = person1.setIn(['pets', 0, 'name'], 'Bane')

    person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Bane')

    person3.pets().get(1).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Unknown')

    person3.getIn(['pets', 0, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Bane')

    person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Unknown')

    person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Robbie')
  })
}
