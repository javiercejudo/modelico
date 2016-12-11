'use strict';

export default M => {
  const Base = M.Base;

  class Code extends Base {
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

  class Region extends Base {
    constructor(fields) {
      super(Region, fields);

      return Object.freeze(this);
    }

    customMethod() {
      return `${this.name()} (${this.code().value()})`;
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        code: Base.metadata(Code)
      });
    }
  }

  return Object.freeze(Region);
};
