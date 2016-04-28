'use strict';

import RegionFactory from './Region';

export default M => {
  const Modelico = M.Modelico;
  const Region = RegionFactory(M);

  class Country extends Modelico {
    constructor(fields) {
      super(Country, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        'name': M.AsIs(String),
        'region': Region.metadata()
      });
    }

    static metadata() {
      return Modelico.metadata(Country);
    }
  }

  return Object.freeze(Country);
};
