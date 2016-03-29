/*jshint node:true, esnext:true, mocha:true */

'use strict';

const should = require('should');
const ModelicoMap = require('../').ModelicoMap;

describe('ModelicoMap', function() {
  describe('stringifying', function() {
    it('should stringify the map correctly', function() {
      const map = new Map([['a', 1], ['b', 2]]);
      const modelicoMap = new ModelicoMap({map});

      JSON.stringify(modelicoMap)
        .should.be.exactly('[["a",1],["b",2]]');
    });

    it('should support null maps', function() {
      const map = null;
      const modelicoMap = new ModelicoMap({map});

      JSON.stringify(modelicoMap)
        .should.be.exactly('null');
    });
  });

  describe('parsing', function() {
    it('should stringify the map correctly', function() {
      const modelicoMap = JSON.parse('[["a",1],["b",2]]', ModelicoMap.reviver);

      modelicoMap.map.get('a')
        .should.be.exactly(1);
    });

    it('should support null maps', function() {
      const modelicoMap = JSON.parse('null', ModelicoMap.reviver);

      should(modelicoMap.map)
        .be.exactly(null);
    });
  });
});
