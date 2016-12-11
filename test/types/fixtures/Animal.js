'use strict';

export default M => {
  const { asIs } = M.metadata;

  class Animal extends M.Base {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      return 'hello';
    }

    static innerTypes() {
      return Object.freeze({
        name: asIs(String)
      });
    }
  }

  return Object.freeze(Animal);
};
