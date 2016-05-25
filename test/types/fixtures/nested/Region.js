'use strict';

export default M => {
  const Modelico = M.Modelico;

  class Region extends Modelico {
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
