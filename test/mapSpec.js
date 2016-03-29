/*jshint node:true, esnext:true, mocha:true */

'use strict';

const should = require('should');
const M = require('../');

const ModelicoMap = M.ModelicoMap;
const ModelicoDate = M.ModelicoDate;

describe('ModelicoMap', function() {
  describe('stringifying', function() {
    it('should stringify the map correctly', function() {
      const map = new Map([
        ['a', new ModelicoDate({date: new Date('1988-04-16T00:00:00.000Z')})],
        ['b', new ModelicoDate({date: null})]
      ]);

      const modelicoMap = new ModelicoMap({map});

      JSON.stringify(modelicoMap)
        .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
    });

    it('should support null maps', function() {
      const map = null;
      const modelicoMap = new ModelicoMap({map});

      JSON.stringify(modelicoMap)
        .should.be.exactly('null');
    });
  });

  describe('parsing', function() {
    it('should parse the map correctly', function() {
      const modelicoMap = JSON.parse(
        '[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]',
        ModelicoMap.buildReviver(String, ModelicoDate)
      );

      modelicoMap.map.get('a').date.getFullYear()
        .should.be.exactly(1988);

      should(modelicoMap.map.get('b').date)
        .be.exactly(null);
    });

    it('should support null maps', function() {
      const modelicoMap = JSON.parse('null', ModelicoMap.buildReviver(String, ModelicoDate));

      should(modelicoMap.map)
        .be.exactly(null);
    });
  });
});
