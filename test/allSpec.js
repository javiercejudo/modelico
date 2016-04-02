/*jshint node:true, esnext:true, mocha:true */

'use strict';

module.exports = (should, M) => () => {
  describe('ModelicoBase', require('./modelicoSpec')(should, M));
  describe('ModelicoMap', require('./mapSpec')(should, M));
  describe('ModelicoList', require('./listSpec')(should, M));
};
