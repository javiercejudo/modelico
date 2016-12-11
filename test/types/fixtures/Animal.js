'use strict';

export default M => {
  const Base = M.Base;

  class Animal extends Base {
    constructor(fields) {
      super(Animal, fields);
    }

    speak() {
      return 'hello';
    }
  }

  return Object.freeze(Animal);
};
