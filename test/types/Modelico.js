'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);
  const PartOfDay = require('./fixtures/PartOfDay')(M);
  const Sex = require('./fixtures/Sex')(M);
  const Animal = require('./fixtures/Animal')(M);

  const Modelico = M.Modelico;
  const ModelicoDate = M.Date;

  const author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","sex":"MALE"}';
  const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

  describe('setting', () => {
    it('should set fields returning a new object', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      // sanity check
      JSON.stringify(author1)
        .should.be.exactly(author1Json);

      author1.givenName().should.be.exactly('Javier');

      // field setting
      const author2 = author1.set('givenName', 'Javi');

      // repeat sanity check
      author1.givenName().should.be.exactly('Javier');

      JSON.stringify(author1)
        .should.be.exactly(author1Json);

      // new object checks
      (author2 === author1).should.be.exactly(false);
      author2.givenName().should.be.exactly('Javi');
      author2.equals(author1).should.be.exactly(false, 'Oops, they are equal');
    });

    it('should set fields recursively returning a new object', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      const author2 = author1.setPath(['givenName'], 'Javi')
        .setPath(['birthday', 'date'], new Date('1989-04-16T00:00:00.000Z'));

      should(author2.birthday().date().getFullYear())
        .be.exactly(1989);

      // verify that the original author1 was not mutated
      should(author1.birthday().date().getFullYear())
        .be.exactly(1988);
    });

    it('edge case when Modelico setPath is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
      const author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);
      const listOfPeople1 = new M.List(Person.metadata(), [author]);

      const listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
      const listOfPeople3 = listOfPeople2.setPath([0], author);

      listOfPeople1.innerList()[0].givenName().should.be.exactly('Javier');
      listOfPeople2.innerList()[0].givenName().should.be.exactly('Javi');
      listOfPeople3.innerList()[0].givenName().should.be.exactly('Javier');
    });
  });

  describe('stringifying', () => {
    it('should stringify types correctly', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      JSON.stringify(author1)
        .should.be.exactly(author1Json);
    });

    it('should support null in Enum', () => {
      const author2 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: null,
        sex: Sex.MALE()
      });

      JSON.stringify(author2)
        .should.be.exactly(author2Json);
    });
  });

  describe('parsing', () => {
    it('should parse types correctly', () => {
      const author1 = Modelico.fromJSON(Person, author1Json);
      const author2 = JSON.parse(author1Json, Modelico.metadata(Person).reviver);

      'Javier Cejudo'
        .should.be.exactly(author1.fullName())
        .and.exactly(author2.fullName());

      should(1988)
        .be.exactly(author1.birthday().date().getFullYear())
        .and.exactly(author2.birthday().date().getFullYear());

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author1.favouritePartOfDay().minTime)
        .and.exactly(author2.favouritePartOfDay().minTime);

      (Sex.MALE().code)
        .should.be.exactly(author1.sex().code)
        .and.exactly(author2.sex().code);
    });

    it('should support null in Enum', () => {
      const author2 = Modelico.fromJSON(Person, author2Json);

      (author2.favouritePartOfDay() === null).should.be.exactly(true);
    });

    it('should work with plain classes extending Modelico', () => {
      const animal = JSON.parse('{"name": "Sam"}', Modelico.metadata(Animal).reviver);

      animal.speak().should.be.exactly('hello');
      animal.name().should.be.exactly('Sam');
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
      });

      const author2 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
      });

      const author3 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo Goñi',
        birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
      });

      author1.equals(author2).should.be.exactly(true);
      author1.equals(author3).should.be.exactly(false);

      author1.should.not.be.exactly(author2);
    });
  });
};
