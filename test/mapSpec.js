/*jshint node:true, esnext:true, mocha:true */

'use strict';

const should = require('should');
const Person = require('./fixtures/Person');
const M = require('../');

const Modelico = M.Modelico;
const ModelicoMap = M.ModelicoMap;
const ModelicoDate = M.ModelicoDate;

describe('ModelicoMap', function() {
  describe('stringifying', function() {
    it('should stringify the map correctly', function() {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(String, ModelicoDate, map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
    });

    it('should support null maps', function() {
      const map = null;
      const modelicoMap = new ModelicoMap(String, ModelicoDate, map);

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

    it('should be parsed correctly when used within another class', function() {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';

      const author = Modelico.fromJSON(Person, authorJson);

      author.lifeEvents.map.get('wedding').date.getFullYear().should.be.exactly(2013);
    });

    it('should support null maps', function() {
      const modelicoMap = JSON.parse('null', ModelicoMap.buildReviver(String, ModelicoDate));

      should(modelicoMap.map)
        .be.exactly(null);
    });
  });

  describe('cloning', function() {
    it('should clone the map correctly', function() {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(String, ModelicoDate, map);
      const modelicoMapClone = modelicoMap.clone();

      modelicoMap.should.not.be.exactly(modelicoMapClone);

      modelicoMap.map.get('a').date.getFullYear()
        .should.be.exactly(1988);

      modelicoMapClone.map.get('a').date.getFullYear()
        .should.be.exactly(1988);
    });
  });

  describe('comparing', function() {
    it('should identify equal instances', function() {
      const modelicoMap = new ModelicoMap(String, ModelicoDate, new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
        ])
      );

      const modelicoMap2 = new ModelicoMap(String, ModelicoDate, new Map([
          ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
        ])
      );

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap2).should.be.exactly(true);
    });
  });
});
