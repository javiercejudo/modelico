'use strict';

import CityFactory from '../types/fixtures/nested/City';

export default (should, M) => () => {
  const Modelico = M.Modelico;
  const City = CityFactory(M);

  it('should showcase the main features', () => {
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","region":{"name":"Europe","code":"EU"}}}`;

    const city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

    city.name().should.be.exactly('Pamplona');
    city.country().name().should.be.exactly('Spain');
    city.country().region().customMethod().should.be.exactly('Europe (EU)');
  });
};
