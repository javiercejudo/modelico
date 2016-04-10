'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;
  const ModelicoAsIs = M.AsIs;
  const ModelicoMap = M.Map;
  const ModelicoDate = M.Date;

  describe('setting', () => {
    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);
      const modelicoMap2 = modelicoMap.set('a', new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoMap2.map().get('a').date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoMap was not mutated
      should(modelicoMap.map().get('a').date().getFullYear())
        .be.exactly(1988);
    });

    it('should set fields returning a new map when part of a path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
      const author = Modelico.fromJSON(Person, authorJson);
      const author2 = author.setPath(['lifeEvents', 'wedding', 'date'], new Date('2013-03-28T00:00:00.000Z'));

      should(author2.lifeEvents().map().get('wedding').date().getFullYear())
        .be.exactly(2013);

      // verify that author was not mutated
      should(author.lifeEvents().map().get('wedding').date().getFullYear())
        .be.exactly(2012);
    });
  });

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new ModelicoDate(null)]
      ]);

      const modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
    });

    it('should support null maps', () => {
      const map = null;
      const modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]',
        ModelicoMap.buildReviver(ModelicoAsIs.metadata(String), ModelicoDate.metadata())
      );

      should(modelicoMap.map().get('a').date().getFullYear())
        .be.exactly(1988);

      should(modelicoMap.map().get('b').date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
      const author = Modelico.fromJSON(Person, authorJson);

      should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);
    });

    it('should support null maps', () => {
      const modelicoMap = JSON.parse('null', ModelicoMap.buildReviver(ModelicoAsIs.metadata(String), ModelicoDate.metadata()));

      should(modelicoMap.map())
        .be.exactly(null);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      const modelicoMap2 = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), new Map([
        ['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap2).should.be.exactly(true);
    });
  });
};
