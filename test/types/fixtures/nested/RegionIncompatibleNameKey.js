'use strict';

export default M => {
  const Modelico = M.Modelico;

  class Code extends Modelico {
    constructor(fields) {
      super(Code, fields);

      return Object.freeze(this);
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
        'code': Modelico.metadata(Code)
      });
    }

    static metadata() {
      return Modelico.metadata(Region);
    }
  }

  return Object.freeze(Region);
};
