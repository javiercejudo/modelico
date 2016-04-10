'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;
  const List = M.List;
  const ModelicoDate = M.Date;

  describe('setting', () => {
    it('should set items in the list correctly', () => {
      const list = [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        new ModelicoDate(null)
      ];

      const modelicoList = new List(ModelicoDate.metadata(), list);

      const modelicoList2 = modelicoList.set(0, new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoList2.list()[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList was not mutated
      should(modelicoList.list()[0].date().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the list correctly when part of a path', () => {
      const list = [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        new ModelicoDate(null)
      ];

      const modelicoList = new List(ModelicoDate.metadata(), list);
      const modelicoList2 = modelicoList.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

      should(modelicoList2.list()[0].date().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList was not mutated
      should(modelicoList.list()[0].date().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('stringifying', () => {
    it('should stringify the list correctly', () => {
      const list = [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        new ModelicoDate(null)
      ];

      const modelicoList = new List(ModelicoDate.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
    });

    it('should support null lists', () => {
      const list = null;
      const modelicoList = new List(ModelicoDate.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z",null]',
        List.metadata(ModelicoDate.metadata()).reviver
      );

      should(modelicoList.list()[0].date().getFullYear())
        .be.exactly(1988);

      should(modelicoList.list()[1].date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author = Modelico.fromJSON(Person, authorJson);

      should(author.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
    });

    it('should support null lists', () => {
      const modelicoList = JSON.parse('null', List.metadata(ModelicoDate.metadata()).reviver);

      should(modelicoList.list())
        .be.exactly(null);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoList = new List(ModelicoDate.metadata(), [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      const modelicoList2 = new List(ModelicoDate.metadata(), [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      modelicoList.should.not.be.exactly(modelicoList2);
      modelicoList.should.not.equal(modelicoList2);

      modelicoList.equals(modelicoList2).should.be.exactly(true);
    });
  });
};
