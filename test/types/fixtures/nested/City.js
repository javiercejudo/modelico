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
        'country': Country.metadata()
      });
    }

    static metadata() {
      return Modelico.metadata(City);
    }
  }

  return Object.freeze(City);
};
