'use strict';

export default (M, Region) => {
  const Modelico = M.Modelico;

  class Country extends Modelico {
    constructor(fields) {
      super(Country, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        code: M.AsIs(String),
        region: Modelico.metadata(Region)
      });
    }
  }

  return Object.freeze(Country);
};
