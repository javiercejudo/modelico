'use strict';

module.exports = (should, M) => () => {

  const Modelico = M.Modelico;
  const AsIs = M.AsIs;
  const List = M.List;

  function Animal(fields) {
    Modelico.factory(Animal, fields, this);
  }

  Animal.prototype = Object.create(Modelico.prototype);

  Animal.prototype.speak = function() {
    var name = this.fields().name;
    return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
  };

  Animal.metadata = Modelico.metadata.bind(undefined, Animal);

  function Person(fields) {
    Modelico.factory(Person, fields, this);
  }

  Person.prototype = Object.create(Modelico.prototype);

  Person.prototype.fullName = function() {
    var fields = this.fields();
    return [fields.givenName, fields.familyName].join(' ').trim();
  };

  Person.innerTypes = function() {
    return Object.freeze({
      'givenName': AsIs(String),
      'familyName': AsIs(String),
      'pets': List.metadata(Animal.metadata())
    });
  };

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

    person1.pets().innerList().shift().speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets().innerList().shift().speak()
      .should.be.exactly('My name is Robbie!');
  });
};
