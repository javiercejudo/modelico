'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const set = M.Set.fromArray([1, 2, 2, 4]);

      Array.from(set)
        .should.eql([1, 2, 4]);
    });

    it('should set items in the set correctly', () => {
      const set = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoSet1 = new M.Set(M.Date.metadata(), set);
      const modelicoSet2 = modelicoSet1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

      should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoSet1 was not mutated
      should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the set correctly when part of a path', () => {
      const set = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoSet1 = new M.Set(M.Date.metadata(), set);
      const modelicoSet2 = modelicoSet1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

      should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoSet1 was not mutated
      should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the set correctly when part of a path with a single element', () => {
      const set = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoSet1 = new M.Set(M.Date.metadata(), set);
      const modelicoSet2 = modelicoSet1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

      should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear())
        .be.exactly(2000);

      // verify that modelicoSet1 was not mutated
      should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should be able to set a whole set', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

      const newSetArray = Array.from(author1.importantDatesSet().innerSet());
      newSetArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

      const author2 = author1.set(
        'importantDatesSet',
        new M.Set(M.Date.metadata(), newSetArray)
      );

      const author1InnerSet = author1.importantDatesSet().innerSet();

      should(author1InnerSet.size).be.exactly(2);
      should(Array.from(author1InnerSet)[0].date().getFullYear()).be.exactly(2013);
      should(Array.from(author1InnerSet)[1].date().getFullYear()).be.exactly(2012);

      const author2InnerSet = author2.importantDatesSet().innerSet();

      should(author2InnerSet.size).be.exactly(3);
      should(Array.from(author2InnerSet)[0].date().getFullYear()).be.exactly(2013);
      should(Array.from(author2InnerSet)[1].date().getFullYear()).be.exactly(2016);
      should(Array.from(author2InnerSet)[2].date().getFullYear()).be.exactly(2012);
    });

    it('edge case when Set setPath is called with an empty path', () => {
      const modelicoDatesSet1 = new M.Set(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ]);

      const modelicoDateSet2 = new Set([
        new M.Date(new Date('2016-04-16T00:00:00.000Z'))
      ]);

      const setOfSetsOfDates1 = new M.Set(M.Set.metadata(M.Date.metadata()), [modelicoDatesSet1]);
      const setOfSetsOfDates2 = setOfSetsOfDates1.setPath([0], modelicoDateSet2);

      should(Array.from(Array.from(setOfSetsOfDates1.innerSet())[0].innerSet())[0].date().getFullYear())
        .be.exactly(1988);

      should(Array.from(Array.from(setOfSetsOfDates2.innerSet())[0].innerSet())[0].date().getFullYear())
        .be.exactly(2016);
    });
  });

  describe('stringifying', () => {
    it('should stringify the set correctly', () => {
      const set = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoSet = new M.Set(M.Date.metadata(), set);

      JSON.stringify(modelicoSet)
        .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
    });

    it('should support null sets', () => {
      const set = null;
      const modelicoSet = new M.Set(M.Date.metadata(), set);

      JSON.stringify(modelicoSet)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the set correctly', () => {
      const modelicoSet = JSON.parse(
        '["1988-04-16T00:00:00.000Z",null]',
        M.Set.metadata(M.Date.metadata()).reviver
      );

      should(Array.from(modelicoSet.innerSet())[0].date().getFullYear())
        .be.exactly(1988);

      should(Array.from(modelicoSet.innerSet())[1].date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

      should(Array.from(author.importantDatesSet().innerSet())[0].date().getFullYear())
        .be.exactly(2013);
    });

    it('should support null sets', () => {
      const modelicoSet = JSON.parse('null', M.Set.metadata(M.Date.metadata()).reviver);

      should(modelicoSet.innerSet())
        .be.exactly(null);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoSet1 = new M.Set(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      const modelicoSet2 = new M.Set(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      modelicoSet1.should.not.be.exactly(modelicoSet2);
      modelicoSet1.should.not.equal(modelicoSet2);

      modelicoSet1.equals(modelicoSet2).should.be.exactly(true);
    });
  });

  describe('from array', () => {
    it('should be able to create a set from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8];

      const modelicoSet = M.Set.fromArray(fibArray);

      Array.from(modelicoSet.innerSet())
        .should.eql([0, 1, 2, 3, 5, 8]);
    });
  });

  describe('from set', () => {
    it('should be able to create a set from a native set', () => {
      const fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

      const modelicoSet = M.Set.fromSet(fibSet);

      Array.from(modelicoSet.innerSet())
        .should.eql([0, 1, 2, 3, 5, 8]);
    });
  });
};
