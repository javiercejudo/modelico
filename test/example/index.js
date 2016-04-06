'use strict';

module.exports = (should, M) => () => {

  const Modelico = M.Modelico;
  const AsIs = M.AsIs;
  const List = M.List;

  class Animal extends Modelico {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      const name = this.fields().name;

      if (name === undefined) {
        return `I don't have a name`;
      }

      return `My name is ${name}!`;
    }

    static metadata() {
      return Object.freeze({type: Animal, reviver: Modelico.buildReviver(Animal)});
    }
  }

  class Person extends Modelico {
    constructor(fields) {
      super(Person, fields);

      Object.freeze(this);
    }

    fullName() {
      const fields = this.fields();

      return [fields.givenName, fields.familyName].join(' ').trim();
    }

    static subtypes() {
      return Object.freeze({
        // JSON compatible types don't need to be declared
        // 'givenName': AsIs.metadata(String),
        'familyName': AsIs.metadata(String),
        'pets': List.metadata(Animal.metadata())
      });
    }
  }

  Object.freeze(Animal);
  Object.freeze(Person);

  it('should showcase the main features', () => {
    const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [{
        "name": "Robbie"
      }]
    }`;

    const person = Modelico.fromJSON(Person, personJson);

    person.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person.fullName().should.be.exactly('Javier Cejudo');

    person.pets().list().shift().speak()
      .should.be.exactly('My name is Robbie!');

    person.pets().list().shift().speak()
      .should.be.exactly('My name is Robbie!');
  });
};
