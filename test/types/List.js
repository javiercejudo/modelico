'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;

  describe('setting', () => {
    it('should set items in the list correctly', () => {
      const list = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoList1 = new M.List(M.Date.metadata(), list);
      const modelicoList2 = modelicoList1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoList2.list()[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.list()[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the list correctly when part of a path', () => {
      const list = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoList1 = new M.List(M.Date.metadata(), list);
      const modelicoList2 = modelicoList1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

      should(modelicoList2.list()[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.list()[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the list correctly when part of a path with a single element', () => {
      const list = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoList1 = new M.List(M.Date.metadata(), list);
      const modelicoList2 = modelicoList1.setPath([0], new M.Date(new Date('2000-04-16T00:00:00.000Z')));

      should(modelicoList2.list()[0].date().getFullYear())
        .be.exactly(2000);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.list()[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should be able to set a whole list', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

      const newListArray = author1.importantDatesList().list();
      newListArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

      const author2 = author1.set(
        'importantDatesList',
        new M.List(M.Date.metadata(), newListArray)
      );

      should(author1.importantDatesList().list().length).be.exactly(2);
      should(author1.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
      should(author1.importantDatesList().list()[1].date().getFullYear()).be.exactly(2012);

      should(author2.importantDatesList().list().length).be.exactly(3);
      should(author2.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
      should(author2.importantDatesList().list()[1].date().getFullYear()).be.exactly(2016);
      should(author2.importantDatesList().list()[2].date().getFullYear()).be.exactly(2012);
    });

    it('edge case when List setPath is called with an empty path', () => {
      const modelicoDatesList1 = new M.List(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ]);

      const modelicoDatesList2 = new M.List(M.Date.metadata(), [
        new M.Date(new Date('2016-04-16T00:00:00.000Z'))
      ]);

      const listOfListOfDates1 = new M.List(M.List.metadata(M.Date.metadata()), [modelicoDatesList1]);
      const listOfListOfDates2 = listOfListOfDates1.setPath([0], modelicoDatesList2);

      should(listOfListOfDates1.list()[0].list()[0].date().getFullYear())
        .be.exactly(1988);

      should(listOfListOfDates2.list()[0].list()[0].date().getFullYear())
        .be.exactly(2016);
    });
  });

  describe('stringifying', () => {
    it('should stringify the list correctly', () => {
      const list = [
        new M.Date(new Date('1988-04-16T00:00:00.000Z')),
        new M.Date(null)
      ];

      const modelicoList = new M.List(M.Date.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
    });

    it('should support null lists', () => {
      const list = null;
      const modelicoList = new M.List(M.Date.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z",null]',
        M.List.metadata(M.Date.metadata()).reviver
      );

      should(modelicoList.list()[0].date().getFullYear())
        .be.exactly(1988);

      should(modelicoList.list()[1].date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

      should(author.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
    });

    it('should support null lists', () => {
      const modelicoList = JSON.parse('null', M.List.metadata(M.Date.metadata()).reviver);

      should(modelicoList.list())
        .be.exactly(null);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoList1 = new M.List(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      const modelicoList2 = new M.List(M.Date.metadata(), [
        new M.Date(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      modelicoList1.should.not.be.exactly(modelicoList2);
      modelicoList1.should.not.equal(modelicoList2);

      modelicoList1.equals(modelicoList2).should.be.exactly(true);
    });
  });
};
