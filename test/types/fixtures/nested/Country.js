'use strict';

export default (M, Region) => {
  const { _, asIs } = M.metadata;

  class Country extends M.Base {
    constructor(fields) {
      super(Country, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        name: asIs(String),
        code: asIs(String),
        region: _(Region)
      });
    }
  }

  return Object.freeze(Country);
};
