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
        'code': M.AsIs(String)
      });
    }

    static metadata() {
      return Modelico.metadata(Region);
    }
  }

  return Object.freeze(Region);
};
