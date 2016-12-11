'use strict';

export default M => {
  const { _, asIs } = M.metadata;

  class Code extends M.Base {
    constructor(fields) {
      super(Code, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        id: M.AsIs(Number),
        value: M.AsIs(String)
      });
    }
  }

  class Region extends M.Base {
    constructor(fields) {
      super(Region, fields);

      return Object.freeze(this);
    }

    customMethod() {
      return `${this.name()} (${this.code().value()})`;
    }

    static innerTypes() {
      return Object.freeze({
        name: asIs(String),
        code: _(Code)
      });
    }
  }

  return Object.freeze(Region);
};
