'use strict';

import CityFactory from '../types/fixtures/nested/City';
import RegionFactory from '../types/fixtures/nested/Region';
import RegionIncompatibleNameKeyFactory from '../types/fixtures/nested/RegionIncompatibleNameKey';

export default (should, M) => () => {
  const Modelico = M.Modelico;

  it('should revive deeply nested JSON', () => {
    const City = CityFactory(M, RegionFactory(M));
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","region":{"name":"Europe","code":"EU"}}}`;

    const city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

    city.name().should.be.exactly('Pamplona');
    city.country().name().should.be.exactly('Spain');
    city.country().region().customMethod().should.be.exactly('Europe (EU)');
  });

  it('should throw when an object has incompatible nested keys', () => {
    const City = CityFactory(M, RegionIncompatibleNameKeyFactory(M));
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","region":{"name":"Europe","code":"EU"}}}`;

    (() => JSON.parse(cityJson, Modelico.metadata(City).reviver))
      .should.throw(`Duplicated typed key 'name' with types String and Any`);
  });
};
