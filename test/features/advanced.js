/* eslint-env mocha */

export default (should, M) => () => {
  const { _, any, maybe, list, string } = M.metadata

  class Animal extends M.Base {
    constructor (fields) {
      super(Animal, fields)
    }

    speak () {
      const name = this.name().getOrElse('')
      return (name === '') ? `I don't have a name` : `My name is ${name}!`
    }

    static innerTypes () {
      return Object.freeze({
        name: maybe(string())
      })
    }
  }

  class Person extends M.Base {
    constructor (fields) {
      super(Person, fields)
    }

    fullName () {
      const fields = M.fields(this)
      return [fields.givenName, fields.familyName].join(' ').trim()
    }

    static innerTypes () {
      return Object.freeze({
        givenName: any(),
        middleName: maybe(any()),
        familyName: string(),
        pets: list(maybe(_(Animal)))
      })
    }
  }

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

    const person1 = JSON.parse(personJson, _(Person).reviver)

    person1.fullName().should.be.exactly('Javier Cejudo')

    const person2 = person1.set('givenName', 'Javi')
    person2.fullName().should.be.exactly('Javi Cejudo')
    person1.fullName().should.be.exactly('Javier Cejudo')

    const defaultAnimal = new Animal({})

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!')

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!')

    const person3 = person1.setPath(['pets', 0, 'name'], 'Bane')

    person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Bane')

    person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Robbie')
  })
}
