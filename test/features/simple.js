/* eslint-env mocha */

export default (should, M) => () => {
  const { _, string } = M.metadata()

  class Animal extends M.Base {
    constructor (props) {
      super(Animal, props)
    }

    speak () {
      const name = this.name()
      return (name === '') ? `I don't have a name` : `My name is ${name}!`
    }

    static innerTypes () {
      return Object.freeze({
        name: string()
      })
    }
  }

  it('should showcase the main features', () => {
    const petJson = `{"name": "Robbie"}`

    const pet1 = JSON.parse(petJson, _(Animal).reviver)

    pet1.speak()
      .should.be.exactly('My name is Robbie!')

    const pet2 = pet1.set('name', 'Bane')

    pet2.name().should.be.exactly('Bane')
    pet1.name().should.be.exactly('Robbie')
  })
}
