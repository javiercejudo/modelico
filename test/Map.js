/*jshint node:true, esnext:true, mocha:true */

'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;
  const ModelicoPrimitive = M.ModelicoPrimitive;
  const ModelicoMap = M.ModelicoMap;
  const ModelicoDate = M.ModelicoDate;

  describe('setting', () => {
    it('should set fields returning a new object', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';

      const author = Modelico.fromJSON(Person, authorJson);

      // sanity check
      JSON.stringify(author)
        .should.be.exactly(authorJson);

      author.givenName().should.be.exactly('Javier');
      author.lifeEvents().map().get('wedding').date().getFullYear().should.be.exactly(2013);

      (function() {
        author.lifeEvents = 1;
      }).should.throw();

      // field setting
      const authorAlt = author.set('givenName', 'Javi');

      // date is protected by always returning a new one
      author.lifeEvents().map().get('wedding').date().setFullYear(2001);

      // objects are protected with Object.freeze
      (function() {
        authorAlt.lifeEvents = 1;
      }).should.throw();


      // repeat sanity check
      JSON.stringify(author)
        .should.be.exactly(authorJson);

      author.givenName().should.be.exactly('Javier');
      author.lifeEvents().map().get('wedding').date().getFullYear().should.be.exactly(2013);

      // new object checks
      (authorAlt === author).should.be.exactly(false);
      (authorAlt.lifeEvents().map() === author.lifeEvents().map()).should.be.exactly(false);
      authorAlt.equals(author).should.be.exactly(false);

      authorAlt.givenName().should.be.exactly('Javi');
      authorAlt.lifeEvents().map().get('wedding').date().getFullYear().should.be.exactly(2013);

      JSON.stringify(authorAlt)
        .should.be.exactly('{"givenName":"Javi","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}');
    });
  });

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(ModelicoPrimitive.metadata(String), ModelicoDate.metadata(), map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
    });

    it('should support null maps', () => {
      const map = null;
      const modelicoMap = new ModelicoMap(ModelicoPrimitive.metadata(String), ModelicoDate.metadata(), map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]',
        ModelicoMap.buildReviver(ModelicoPrimitive.metadata(String), ModelicoDate.metadata())
      );

      modelicoMap.map().get('a').date().getFullYear()
        .should.be.exactly(1988);

      should(modelicoMap.map().get('b').date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';

      const author = Modelico.fromJSON(Person, authorJson);

      author.lifeEvents().map().get('wedding').date().getFullYear().should.be.exactly(2013);
    });

    it('should support null maps', () => {
      const modelicoMap = JSON.parse('null', ModelicoMap.buildReviver(ModelicoPrimitive.metadata(String), ModelicoDate.metadata()));

      should(modelicoMap.map())
        .be.exactly(null);
    });
  });

  describe('cloning', () => {
    it('should clone the map correctly', () => {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(ModelicoPrimitive.metadata(String), ModelicoDate.metadata(), map);
      const modelicoMapClone = modelicoMap.clone();

      modelicoMap.should.not.be.exactly(modelicoMapClone);

      modelicoMap.map().get('a').date().getFullYear()
        .should.be.exactly(1988);

      modelicoMapClone.map().get('a').date().getFullYear()
        .should.be.exactly(1988);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = new ModelicoMap(ModelicoPrimitive.metadata(String), ModelicoDate.metadata(), new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      const modelicoMap2 = new ModelicoMap(ModelicoPrimitive.metadata(String), ModelicoDate.metadata(), new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap2).should.be.exactly(true);
    });
  });
};
