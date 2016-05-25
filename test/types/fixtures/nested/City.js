'use strict';

import CountryFactory from './Country';

export default (M, Region) => {
  const Modelico = M.Modelico;
  const Country = CountryFactory(M, Region);

  class City extends Modelico {
    constructor(fields) {
      super(City, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        country: Modelico.metadata(Country)
      });
    }
  }

  return Object.freeze(City);
};
