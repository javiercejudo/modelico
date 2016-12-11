'use strict';

export default (should, M) => () => {
  class Country extends M.Base {
    constructor(code) {
      super(Country, {code});
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP');
  });
};
