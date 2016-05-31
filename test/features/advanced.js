'use strict';

export default (should, M) => () => {
  const Modelico = M.Modelico;
  const { fieldsSymbol, innerSymbol } = M.symbols;

  class Animal extends Modelico {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      const name = this[fieldsSymbol]().name;
      return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
    }
  }

  class Person extends Modelico {
    constructor(fields) {
      super(Person, fields);
    }

    fullName() {
      const fields = this[fieldsSymbol]();
      return [fields.givenName, fields.familyName].join(' ').trim();
    }

    static innerTypes() {
      return Object.freeze({
        givenName: M.AsIs(M.Any),
        familyName: M.AsIs(String),
        pets: M.List.metadata(Modelico.metadata(Animal))
      });
    }
  }

  it('should showcase the main features', () => {
    const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [{
        "name": "Robbie"
      }]
    }`;

    const person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    person1.pets()[innerSymbol]().shift().speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets()[innerSymbol]().shift().speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

    person3.pets()[innerSymbol]()[0].name()
      .should.be.exactly('Bane');

    person1.pets()[innerSymbol]()[0].name()
      .should.be.exactly('Robbie');
  });
};
