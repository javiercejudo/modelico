'use strict';

export default (should, M) => () => {
  const Modelico = M.Modelico;

  class Country extends Modelico {
    constructor(code) {
      super(Country, {code});
    }

    static metadata() {
      return Modelico.metadata(Country);
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    Modelico.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP');
  });
};
