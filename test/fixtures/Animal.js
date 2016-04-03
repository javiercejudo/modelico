'use strict';

module.exports = M => {
  const Modelico = M.Modelico;

  class Animal extends Modelico {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      return 'hello';
    }
  }

  return Object.freeze(Animal);
};
