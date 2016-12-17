'use strict';

export default (should, M) => () => {
  const { _, asIs, list } = M.metadata;

  function Animal(fields) {
    M.Base.factory(Animal, fields, this);
  }

  Animal.prototype = Object.create(M.Base.prototype);

  Animal.prototype.speak = function() {
    var name = this.name();
    return (name === '') ? "I don't have a name" : 'My name is ' + name + '!';
  };

  Animal.innerTypes = function() {
    return Object.freeze({
      name: asIs(String)
    });
  };

  function Person(fields) {
    M.Base.factory(Person, fields, this);
  }

  Person.prototype = Object.create(M.Base.prototype);

  Person.prototype.fullName = function() {
    return [this.givenName(), this.familyName()].join(' ').trim();
  };

  Person.innerTypes = function() {
    return Object.freeze({
      givenName: asIs(String),
      familyName: asIs(String),
      pets: list(_(Animal))
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

    const person1 = JSON.parse(personJson, _(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    person1.pets().inner().shift().speak()
      .should.be.exactly('My name is Robbie!');

    person1.pets().inner().shift().speak()
      .should.be.exactly('My name is Robbie!');
  });
};
