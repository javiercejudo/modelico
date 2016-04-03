'use strict';

module.exports = (should, M) => () => {
  describe('ModelicoBase', require('./Modelico')(should, M));
  describe('ModelicoAsIs', require('./AsIs')(should, M));
  describe('ModelicoMap', require('./Map')(should, M));
  describe('ModelicoList', require('./List')(should, M));
};
