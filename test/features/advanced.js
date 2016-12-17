'use strict';

export default (should, M) => () => {
  const { _, asIs, any, maybe, list } = M.metadata;

  class Animal extends M.Base {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      const name = this.name().getOrElse('');
      return (name === '') ? `I don't have a name` : `My name is ${name}!`;
    }

    static innerTypes() {
      return Object.freeze({
        name: maybe(asIs(String))
      });
    }
  }

  class Person extends M.Base {
    constructor(fields) {
      super(Person, fields);
    }

    fullName() {
      const fields = M.fields(this);
      return [fields.givenName, fields.familyName].join(' ').trim();
    }

    static innerTypes() {
      return Object.freeze({
        givenName: any(),
        middleName: maybe(any()),
        familyName: asIs(String),
        pets: list(maybe(_(Animal)))
      });
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
    }`;

    const person1 = JSON.parse(personJson, _(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    const defaultAnimal = new Animal({});

    person1.pets().inner().shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets().inner().shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

    person3.pets().inner()[0].getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Bane');

    person1.pets().inner()[0].getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Robbie');
  });
};
