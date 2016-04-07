'use strict';

module.exports = (should, M) => () => {

  const Modelico = M.Modelico;
  const AsIs = M.AsIs;
  const List = M.List;

  function Animal(fields) {
    Object.assign(this, new Modelico(Animal, fields));
  }

  Animal.prototype = Object.create(Modelico.prototype);

  Animal.prototype.speak = function() {
    var name = this.fields().name;
    return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
  };

  Animal.metadata = function() {
    return Object.freeze({type: Animal, reviver: Modelico.buildReviver(Animal)});
  };

  function Person(fields) {
    Object.assign(this, new Modelico(Person, fields));
  }

  Person.prototype = Object.create(Modelico.prototype);

  Person.prototype.fullName = function() {
    var fields = this.fields();
    return [fields.givenName, fields.familyName].join(' ').trim();
  };

  Person.subtypes = function() {
    return Object.freeze({
      'givenName': AsIs.metadata(String),
      'familyName': AsIs.metadata(String),
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
