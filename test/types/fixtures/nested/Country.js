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
        name: M.AsIsWithOptions({required: true, nullable: false}, String),
        code: M.AsIsWithOptions({required: true, nullable: true}, String),
        region: Modelico.metadataWithOptions({required: true}, Region)
      });
    }
  }

  return Object.freeze(Country);
};
