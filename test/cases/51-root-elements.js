'use strict';

export default (should, M) => () => {
  const Base = M.Base;

  class Country extends Base {
    constructor(code) {
      super(Country, {code});
    }

    static metadata() {
      return Base.metadata(Country);
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP');
  });
};
