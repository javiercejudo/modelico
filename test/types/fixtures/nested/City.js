'use strict';

import CountryFactory from './Country';

export default (M, Region) => {
  const Country = CountryFactory(M, Region);
  const { _, asIs } = M.metadata;

  class City extends M.Base {
    constructor(fields) {
      super(City, fields);

      return Object.freeze(this);
    }

    static innerTypes(depth) {
      return Object.freeze({
        name: asIs(String),
        country: _(Country, depth)
      });
    }
  }

  return Object.freeze(City);
};
