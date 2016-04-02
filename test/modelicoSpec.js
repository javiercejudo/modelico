/*jshint node:true, esnext:true, mocha:true */

'use strict';

module.exports = (should, M) => () => {
  describe('ModelicoBase', require('./Modelico')(should, M));
  describe('ModelicoMap', require('./Map')(should, M));
  describe('ModelicoList', require('./List')(should, M));
};
