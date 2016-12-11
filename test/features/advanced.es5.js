'use strict';

export default (should, M) => () => {
  const Base = M.Base;
  const { asIs, list, _ } = M.metadata;

  function Animal(fields) {
    Base.factory(Animal, fields, this);
  }

  Animal.prototype = Object.create(Base.prototype);

  Animal.prototype.speak = function() {
    var name = M.fields(this).name;
    return (name === undefined) ? "I don't have a name" : 'My name is ' + name + '!';
  };

  function Person(fields) {
    Base.factory(Person, fields, this);
  }

  Person.prototype = Object.create(Base.prototype);

  Person.prototype.fullName = function() {
    var fields = M.fields(this);
    return [fields.givenName, fields.familyName].join(' ').trim();
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

    const person1 = JSON.parse(personJson, Base.metadata(Person).reviver);

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
