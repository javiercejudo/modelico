'use strict';

export default ({jsonSchema}, should, M) => () => {
  const Modelico = M.Modelico;

  // var Validator = jsonSchema.Validator;
  // var v = new Validator();
  //
  // var animalSchema = {
  //   id: '/Animal',
  //   type: 'object',
  //   properties: {
  //     name: {type: 'string'}
  //   },
  //   required: ['name']
  // };
  //
  // var personSchema = {
  //   id: '/Person',
  //   type: 'object',
  //   properties: {
  //     givenName: {type: 'any'},
  //     familyName: {type: 'string'},
  //     pets: {
  //       type: 'array',
  //       items: {$ref: '/Animal'}
  //     }
  //   },
  //   required: ['givenName', 'familyName']
  // };
  //
  // var person = {
  //   givenName: 'Javier',
  //   familyName: '',
  //   pets: [{
  //     'name': 'Robbie'
  //   }]
  // };
  //
  // v.addSchema(animalSchema, '/Animal');
  // console.log(v.validate(person, personSchema));

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
      return [this.givenName(), this.familyName()].join(' ').trim();
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

    person1.pets().inner().shift().speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets().inner().shift().speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

    person3.pets().inner()[0].name()
      .should.be.exactly('Bane');

    person1.pets().inner()[0].name()
      .should.be.exactly('Robbie');
  });
};
