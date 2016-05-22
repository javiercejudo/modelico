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
        name: M.AsIsWithOptions({required: true}, String),
        code: M.AsIsWithOptions({required: true, strict: true}, String)
      });
    }
  }

  return Object.freeze(Region);
};
