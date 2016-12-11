'use strict';

export default (should, M) => () => {
  const { asIs } = M.metadata;

  class Country extends M.Base {
    constructor(code) {
      super(Country, {code});
    }

    static innerTypes() {
      return Object.freeze({
        code: asIs(String)
      });
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP');
  });
};
