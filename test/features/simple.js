'use strict';

export default (should, M) => () => {
  const Modelico = M.Modelico;
  const { fieldsSymbol } = M.symbols;

  class Animal extends Modelico {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      const name = this[fieldsSymbol]().name;
      return (name === undefined) ? `I don't have a name` : `My name is ${name}!`;
    }
  }

  it('should showcase the main features', () => {
    const petJson = `{"name": "Robbie"}`;

    const pet1 = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

    pet1.speak()
      .should.be.exactly('My name is Robbie!');

    const pet2 = pet1.set('name', 'Bane');

    pet2.name().should.be.exactly('Bane');
    pet1.name().should.be.exactly('Robbie');
  });
};
