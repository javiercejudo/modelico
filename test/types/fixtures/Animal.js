'use strict';

export default M => {
  class Animal extends M.Base {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      return 'hello';
    }
  }

  return Object.freeze(Animal);
};
