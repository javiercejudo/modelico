'use strict';

export default M => {
  const Modelico = M.Modelico;

  class Code extends Modelico {
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

  class Region extends Modelico {
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
        code: Modelico.metadata(Code)
      });
    }
  }

  return Object.freeze(Region);
};
