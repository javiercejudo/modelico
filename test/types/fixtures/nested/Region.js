'use strict';

export default M => {
  const { asIs } = M.metadata;

  class Region extends M.Base {
    constructor(fields) {
      super(Region, fields);

      return Object.freeze(this);
    }

    customMethod() {
      return `${this.name()} (${this.code()})`;
    }

    static innerTypes() {
      return Object.freeze({
        name: asIs(String),
        code: asIs(String)
      });
    }
  }

  return Object.freeze(Region);
};
