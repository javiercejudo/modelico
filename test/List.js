/*jshint node:true, esnext:true, mocha:true */

'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);

  const Modelico = M.Modelico;
  const ModelicoList = M.List;
  const ModelicoDate = M.Date;

  describe('stringifying', () => {
    it('should stringify the list correctly', () => {
      const list = [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        new ModelicoDate(null)
      ];

      const modelicoList = new ModelicoList(ModelicoDate.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
    });

    it('should support null lists', () => {
      const list = null;
      const modelicoList = new ModelicoList(ModelicoDate.metadata(), list);

      JSON.stringify(modelicoList)
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z",null]',
        ModelicoList.buildReviver(ModelicoDate.metadata())
      );

      modelicoList.list()[0].date().getFullYear()
        .should.be.exactly(1988);

      should(modelicoList.list()[1].date())
        .be.exactly(null);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';

      const author = Modelico.fromJSON(Person, authorJson);

      author.importantDatesList().list()[0].date().getFullYear().should.be.exactly(2013);
    });

    it('should support null lists', () => {
      const modelicoList = JSON.parse('null', ModelicoList.buildReviver(ModelicoDate.metadata()));

      should(modelicoList.list())
        .be.exactly(null);
    });
  });

  describe('cloning', () => {
    it('should clone the map correctly', () => {
      const map = [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        'b', new ModelicoDate(null)
      ];

      const modelicoList = new ModelicoList(ModelicoDate.metadata(), map);
      const modelicoListClone = modelicoList.clone();

      modelicoList.should.not.be.exactly(modelicoListClone);

      modelicoList.list()[0].date().getFullYear()
        .should.be.exactly(1988);

      modelicoListClone.list()[0].date().getFullYear()
        .should.be.exactly(1988);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoList = new ModelicoList(ModelicoDate.metadata(), [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      const modelicoList2 = new ModelicoList(ModelicoDate.metadata(), [
        new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))
      ]);

      modelicoList.should.not.be.exactly(modelicoList2);
      modelicoList.should.not.equal(modelicoList2);

      modelicoList.equals(modelicoList2).should.be.exactly(true);
    });
  });
};
