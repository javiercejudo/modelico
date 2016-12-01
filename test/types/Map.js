'use strict';

import PersonFactory from './fixtures/Person';

export default (should, M) => () => {
  const Person = PersonFactory(M);
  const Modelico = M.Modelico;

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        ['A', 'Good morning!'],
        ['B', 'Good afternoon!'],
        ['C', 'Good evening!']
      ]);

      const enumMap = new M.Map(input);

      input.set('A', "g'day!");

      enumMap.inner().get('A')
        .should.be.exactly('Good morning!');
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const map = M.Map.fromObject({a: 1, b: 2, c: 3});

      [...map]
        .should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Map(null))
        .should.throw();
    });

    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new M.Date(new Date())]
      ]);

      const modelicoMap1 = new M.Map(map);
      const modelicoMap2 = modelicoMap1.set('a', new M.Date(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoMap2.inner().get('a').inner().getFullYear())
        .be.exactly(1989);

      // verify that modelicoMap1 was not mutated
      should(modelicoMap1.inner().get('a').inner().getFullYear())
        .be.exactly(1988);
    });

    it('should set fields returning a new map when part of a path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author1 = Modelico.fromJSON(Person, authorJson);
      const author2 = author1.setPath(['lifeEvents', 'wedding', 'date'], new Date('2010-03-28T00:00:00.000Z'));

      should(author2.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2010);

      // verify that author1 was not mutated
      should(author1.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2013);
    });

    it('edge case when setPath is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author = Modelico.fromJSON(Person, authorJson);

      const map = author.lifeEvents();

      should(map.inner().get('wedding').inner().getFullYear())
        .be.exactly(2013);

      const customMap = new Map([
        ['wedding', new M.Date(new Date('2010-03-28T00:00:00.000Z'))]
      ]);

      const map2 = map.setPath([], customMap);

      should(map2.inner().get('wedding').inner().getFullYear())
        .be.exactly(2010);
    });
  });

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', new M.Date(new Date('2012-12-25T00:00:00.000Z'))]
      ]);

      const modelicoMap = new M.Map(map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":"2012-12-25T00:00:00.000Z"}]');
    });
  });

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":"2012-12-25T00:00:00.000Z"}]',
        M.Map.metadata(M.AsIs(String), M.Date.metadata()).reviver
      );

      should(modelicoMap.inner().get('a').inner().getFullYear())
        .be.exactly(1988);

      should(modelicoMap.inner().get('b').inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author = Modelico.fromJSON(Person, authorJson);

      should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        M.Map.metadata(M.AsIs(String), M.Date.metadata()).reviver
      )).should.throw();
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = new M.Map(new Map([
        ['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      const modelicoMap2 = new M.Map(new Map([
        ['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap2).should.be.exactly(true);
    });
  });

  describe('from object', () => {
    it('should be able to create a set from an array', () => {
      var map1 = M.Map.fromObject({a: 1, b: 2, c: 3});

      should(map1.inner().get('b')).be.exactly(2);
    });
  });

  describe('from map', () => {
    it('should be able to create a set from a native set', () => {
      var map1 = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

      should(map1.inner().get('b')).be.exactly(2);
    });
  });
};
