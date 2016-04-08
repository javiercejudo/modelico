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
      return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
    }
  }

  it('should showcase the main features', () => {
    const petJson = `{"name": "Robbie"}`;

    const pet = JSON.parse(petJson, Modelico.buildReviver(Animal));

    pet.speak()
      .should.be.exactly('My name is Robbie!');
  });
};
