'use strict';

export default (should, M) => () => {
  const Modelico = M.Modelico;
  const { asIs, any, maybe, list, _ } = M.metadata;

  class Animal extends Modelico {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      const name = M.fields(this).name;
      return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
    }
  }

  class Person extends Modelico {
    constructor(fields) {
      super(Person, fields);
    }

    fullName() {
      const fields = M.fields(this);
      return [fields.givenName, fields.familyName].join(' ').trim();
    }

    static innerTypes() {
      return Object.freeze({
        givenName: asIs(any),
        middleName: maybe(asIs(any)),
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

    const person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    person1.pets().inner().shift().getOrElse({ speak: () => 'hello' }).speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets().inner().shift().getOrElse({ speak: () => 'hello' }).speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

    person3.pets().inner()[0].getOrElse({ name: () => 'no' }).name()
      .should.be.exactly('Bane');

    person1.pets().inner()[0].getOrElse({ name: () => 'no' }).name()
      .should.be.exactly('Robbie');
  });
};
