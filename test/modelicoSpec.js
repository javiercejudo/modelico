'use strict';

module.exports = (should, M) => _ => {
  const deps = [should, M];

  describe('ModelicoBase', require('./types/Modelico').apply(_, deps));
  describe('ModelicoAsIs', require('./types/AsIs').apply(_, deps));
  describe('ModelicoMap', require('./types/Map').apply(_, deps));
  describe('ModelicoList', require('./types/List').apply(_, deps));
};
