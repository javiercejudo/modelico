'use strict';

module.exports = (should, M) => () => {
  const Person = require('./fixtures/Person')(M);
  const PartOfDay = require('./fixtures/PartOfDay')(M);
  const Sex = require('./fixtures/Sex')(M);
  const Animal = require('./fixtures/Animal')(M);

  const Modelico = M.Modelico;
  const ModelicoDate = M.Date;

  const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","sex":"MALE"}';
  const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

  describe('setting', () => {
    it('should set fields returning a new object', () => {
      const author = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      // sanity check
      JSON.stringify(author)
        .should.be.exactly(authorJson);

      author.givenName().should.be.exactly('Javier');

      // field setting
      const authorAlt = author.set('givenName', 'Javi');

      // repeat sanity check
      author.givenName().should.be.exactly('Javier');

      JSON.stringify(author)
        .should.be.exactly(authorJson);

      // new object checks
      (authorAlt === author).should.be.exactly(false);
      authorAlt.givenName().should.be.exactly('Javi');
      authorAlt.equals(author).should.be.exactly(false, 'Oops, they are equal');
    });

    it('should set fields recursively returning a new object', () => {
      const author = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      const author2 = author.setPath(['givenName'], 'Javi')
        .setPath(['birthday', 'date'], new Date('1989-04-16T00:00:00.000Z'));

      should(author2.birthday().date().getFullYear())
        .be.exactly(1989);

      // verify that the original author was not mutated
      should(author.birthday().date().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('stringifying', () => {
    it('should stringify types correctly', () => {
      const author = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: Sex.MALE()
      });

      JSON.stringify(author)
        .should.be.exactly(authorJson);
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
      const author = Modelico.fromJSON(Person, authorJson);
      const authorAlt = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

      'Javier Cejudo'
        .should.be.exactly(author.fullName())
        .and.exactly(authorAlt.fullName());

      should(1988)
        .be.exactly(author.birthday().date().getFullYear())
        .and.exactly(authorAlt.birthday().date().getFullYear());

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author.favouritePartOfDay().minTime)
        .and.exactly(authorAlt.favouritePartOfDay().minTime);

      (Sex.MALE().code)
        .should.be.exactly(author.sex().code)
        .and.exactly(authorAlt.sex().code);
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
