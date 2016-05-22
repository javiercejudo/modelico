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
        id: M.AsIsWithOptions({strict: true}, Number),
        value: M.AsIsWithOptions({strict: true}, String)
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
        name: M.AsIsWithOptions({required: true}, String),
        code: Modelico.metadataWithOptions({required: true}, Code)
      });
    }
  }

  return Object.freeze(Region);
};
