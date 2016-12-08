'use strict';

export default M => {
  const Base = M.Base;

  class Region extends Base {
    constructor(fields) {
      super(Region, fields);

      return Object.freeze(this);
    }

    customMethod() {
      return `${this.name()} (${this.code()})`;
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        code: M.AsIs(String)
      });
    }
  }

  return Object.freeze(Region);
};
