'use strict';

import CityFactory from '../types/fixtures/nested/City';
import RegionFactory from '../types/fixtures/nested/Region';

export default (should, M) => () => {
  const Modelico = M.Modelico;

  it('should support metadata options: required', () => {
    const City = CityFactory(M, RegionFactory(M));
    const cityJson = `{"country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}`;

    (() => JSON.parse(cityJson, Modelico.metadata(City).reviver))
      .should.throw('"name" in City is required');
  });

  it('should support metadata options: strict', () => {
    const City = CityFactory(M, RegionFactory(M));
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":1}}}`;

    (() => JSON.parse(cityJson, Modelico.metadata(City).reviver))
      .should.throw('"code" in Region must be of type String');
  });

  it('should support metadata options: nullable:true', () => {
    const City = CityFactory(M, RegionFactory(M));
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":null,"region":{"name":"Europe","code":"EU"}}}`;

    const city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

    should(city.country().code()).be.exactly(null);
  });

  it('should support metadata options: nullable:false', () => {
    const City = CityFactory(M, RegionFactory(M));
    const cityJson = `{"name":"Pamplona","country":{"name":null,"code":"ESP","region":{"name":"Europe","code":"EU"}}}`;

    (() => JSON.parse(cityJson, Modelico.metadata(City).reviver))
      .should.throw('"name" in Country cannot be null');
  });
};
