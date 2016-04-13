'use strict';

module.exports = (should, M) => _ => {
  const deps = [should, M];

  describe('ModelicoBase', require('./types/Modelico').apply(_, deps));
  describe('ModelicoAsIs', require('./types/AsIs').apply(_, deps));
  describe('ModelicoMap', require('./types/Map').apply(_, deps));
  describe('ModelicoEnumMap', require('./types/EnumMap').apply(_, deps));
  describe('ModelicoList', require('./types/List').apply(_, deps));
  describe('Readme Simple Example', require('./example/simple').apply(_, deps));
  describe('Readme Advanced Example', require('./example/advanced').apply(_, deps));
  describe('Readme Advanced Example ES5', require('./example/advanced.es5').apply(_, deps));
  describe('Immutable.js examples', require('./Immutable.js/').apply(_, deps));
};
