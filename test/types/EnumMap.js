'use strict';

import PartOfDayFactory from './fixtures/PartOfDay';

export default (should, M) => () => {
  const PartOfDay = PartOfDayFactory(M);

  describe('setting', () => {
    it('should set fields returning a new enum map', () => {
      const map = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ]);

      const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);
      const greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

      greetings2.inner().get(PartOfDay.AFTERNOON())
        .should.be.exactly('GOOD AFTERNOON!');

      greetings1.inner().get(PartOfDay.AFTERNOON())
        .should.be.exactly('Good afternoon!');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), null))
        .should.throw();
    });

    it('should set fields returning a new enum map when part of a path', () => {
      const map = new Map([
        [PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]
      ]);

      const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map);
      const greetings2 = greetings1.setPath([PartOfDay.EVENING(), 'date'], new Date('2013-04-16T00:00:00.000Z'));

      should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2013);

      should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2012);
    });

    it('edge case when setPath is called with an empty path', () => {
      const map1 = new Map([
        [PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]
      ]);

      const map2 = new Map([
        [PartOfDay.MORNING(), new M.Date(new Date('1989-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), new M.Date(new Date('2001-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), new M.Date(new Date('2013-04-16T00:00:00.000Z'))]
      ]);

      const greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map1);
      const greetings2 = greetings1.setPath([], map2);

      should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2013);

      should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2012);
    });
  });

  describe('stringifying', () => {
    it('should stringify the enum map correctly', () => {
      const map = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ]);

      const greetings = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);

      JSON.stringify(greetings)
        .should.be.exactly('{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}');
    });
  });

  describe('parsing', () => {
    it('should parse the enum map correctly', () => {
      const greetings = JSON.parse(
        '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":[]}',
        M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(M.Any)).reviver
      );

      greetings.inner().get(PartOfDay.MORNING())
        .should.be.exactly('Good morning!');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(String)).reviver
      )).should.throw();
    });
  });
};
