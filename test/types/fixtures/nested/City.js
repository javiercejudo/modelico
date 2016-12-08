'use strict';

import CountryFactory from './Country';

export default (M, Region) => {
  const Base = M.Base;
  const Country = CountryFactory(M, Region);

  class City extends Base {
    constructor(fields) {
      super(City, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        country: Base.metadata(Country)
      });
    }
  }

  return Object.freeze(City);
};
