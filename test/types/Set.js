'use strict';

import PersonFactory from './fixtures/Person';

export default (should, M) => () => {
  const Base = M.Base;
  const Person = PersonFactory(M);

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Set(['a', 'b', 'c']);
      const set = M.Set.fromSet(input);

      input.delete('a');

      set.inner().has('a')
        .should.be.exactly(true);
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const set = M.Set.fromArray([1, 2, 2, 4]);

      [...set]
        .should.eql([1, 2, 4]);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse('null', M.Set.metadata(M.Date.metadata()).reviver))
        .should.throw();
    });

    it('should be able to set a whole set', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
      const author1 = JSON.parse(authorJson, Base.metadata(Person).reviver);

      const newSetArray = [...author1.importantDatesSet().inner()];
      newSetArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

      const author2 = author1.set(
        'importantDatesSet',
        M.Set.fromArray(newSetArray)
      );

      const author1InnerSet = author1.importantDatesSet().inner();

      should(author1InnerSet.size).be.exactly(2);
      should([...author1InnerSet][0].inner().getFullYear()).be.exactly(2013);
      should([...author1InnerSet][1].inner().getFullYear()).be.exactly(2012);

      const author2InnerSet = author2.importantDatesSet().inner();

      should(author2InnerSet.size).be.exactly(3);
      should([...author2InnerSet][0].inner().getFullYear()).be.exactly(2013);
      should([...author2InnerSet][1].inner().getFullYear()).be.exactly(2016);
      should([...author2InnerSet][2].inner().getFullYear()).be.exactly(2012);
    });

    it('edge case when Set setPath is called with an empty path', () => {
      const modelicoDatesSet1 = M.Set.of(
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(new Date())
      );

      const modelicoDatesSet2 = new Set([
        new M.Date(new Date('2016-04-16T00:00:00.000Z'))
      ]);

      const listOfSetsOfDates1 = M.List.of(modelicoDatesSet1);
      const listOfSetsOfDates2 = listOfSetsOfDates1.setPath([0], modelicoDatesSet2);

      should([...[...listOfSetsOfDates1.inner()][0].inner()][0].inner().getFullYear())
        .be.exactly(1988);

      should([...[...listOfSetsOfDates2.inner()][0].inner()][0].inner().getFullYear())
        .be.exactly(2016);
    });

    it('should not support the set operation', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.set(0, 3))
        .should.throw();
    });

    it('should not support the setPath operation with non-empty paths', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.setPath([0], 3))
        .should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify the set correctly', () => {
      const set = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(new Date('2012-12-25T00:00:00.000Z'))
      ];

      const modelicoSet = M.Set.fromArray(set);

      JSON.stringify(modelicoSet)
        .should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Set(null))
        .should.throw();
    });
  });

  describe('parsing', () => {
    it('should parse the set correctly', () => {
      const modelicoSet = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        M.Set.metadata(M.Date.metadata()).reviver
      );

      should([...modelicoSet.inner()][0].inner().getFullYear())
        .be.exactly(1988);

      should([...modelicoSet.inner()][1].inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
      const author = JSON.parse(authorJson, Base.metadata(Person).reviver);

      should([...author.importantDatesSet().inner()][0].inner().getFullYear())
        .be.exactly(2013);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoSet1 = M.Set.of(new M.Date(new Date('1988-04-16T00:00:00.000Z')));
      const modelicoSet2 = M.Set.of(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

      modelicoSet1.should.not.be.exactly(modelicoSet2);
      modelicoSet1.should.not.equal(modelicoSet2);

      modelicoSet1.equals(modelicoSet2).should.be.exactly(true);
    });
  });

  describe('EMPTY / of / fromArray / fromSet', () => {
    it('should have a static property for the empty set', () => {
      should(M.Set.EMPTY.inner().size)
        .be.exactly(0);

      M.Set.EMPTY.toJSON()
        .should.eql([]);
    });

    it('should be able to create a set from arbitrary parameters', () => {
      const modelicoSet = M.Set.of(0, 1, 1, 2, 3, 5, 8);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });

    it('should be able to create a set from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8];

      const modelicoSet = M.Set.fromArray(fibArray);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });

    it('should be able to create a set from a native set', () => {
      const fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

      const modelicoSet = M.Set.fromSet(fibSet);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });
  });
};
