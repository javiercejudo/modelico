'use strict';

export default (M, Region) => {
  const Base = M.Base;

  class Country extends Base {
    constructor(fields) {
      super(Country, fields);

      return Object.freeze(this);
    }

    static innerTypes() {
      return Object.freeze({
        name: M.AsIs(String),
        code: M.AsIs(String),
        region: Base.metadata(Region)
      });
    }
  }

  return Object.freeze(Country);
};
