'use strict';

import PersonFactory from './fixtures/Person';
import PartOfDayFactory from './fixtures/PartOfDay';
import SexFactory from './fixtures/Sex';
import AnimalFactory from './fixtures/Animal';
import FriendFactory from './fixtures/Friend';

export default (U, should, M) => () => {
  const Person = PersonFactory(M);
  const PartOfDay = PartOfDayFactory(M);
  const Sex = SexFactory(M);
  const Animal = AnimalFactory(M);
  const Friend = FriendFactory(M);
  const { _, asIs } = M.metadata;

  const ModelicoDate = M.Date;

  const author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
  const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

  describe('immutability', () => {
    U.skipIfNoObjectFreeze('must freeze wrapped input', () => {
      const authorFields = {
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      };

      const author = new Person(authorFields);

      (() => authorFields.givenName = 'Javi')
        .should.throw();

      author.givenName()
        .should.be.exactly('Javier');
    });
  });

  describe('innerTypes check', () => {
    class Country extends M.Base {
      constructor(code) {
        super(Country, {code});
      }
    }

    it('should throw when static innerTypes are missing', () => {
      (() => M.fromJSON(Country, '"ESP"'))
        .should.throw(/missing static innerTypes/);
    });
  });

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      (() => M.fromJSON(Person, author2Json))
        .should.throw();

      (() => new Person(null))
        .should.throw();
    });

    it('should set fields returning a new object', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
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
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      });

      const author2 = author1.setPath(['givenName'], 'Javi')
        .setPath(['birthday'], new Date('1989-04-16T00:00:00.000Z'));

      should(author2.birthday().inner().getFullYear())
        .be.exactly(1989);

      // verify that the original author1 was not mutated
      should(author1.birthday().inner().getFullYear())
        .be.exactly(1988);
    });

    it('edge case when Modelico setPath is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);
      const listOfPeople1 = M.List.of(author);

      const listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
      const listOfPeople3 = listOfPeople2.setPath([0], M.fields(author));

      listOfPeople1.inner()[0].givenName().should.be.exactly('Javier');
      listOfPeople2.inner()[0].givenName().should.be.exactly('Javi');
      listOfPeople3.inner()[0].givenName().should.be.exactly('Javier');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: null,
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      })).should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify types correctly', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      });

      JSON.stringify(author1)
        .should.be.exactly(author1Json);
    });
  });

  describe('parsing', () => {
    it('should parse types correctly', () => {
      const author1 = M.fromJSON(Person, author1Json);
      const author2 = JSON.parse(author1Json, _(Person).reviver);

      'Javier Cejudo'
        .should.be.exactly(author1.fullName())
        .and.exactly(author2.fullName());

      should(1988)
        .be.exactly(author1.birthday().inner().getFullYear())
        .and.exactly(author2.birthday().inner().getFullYear());

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author1.favouritePartOfDay().minTime)
        .and.exactly(author2.favouritePartOfDay().minTime);

      (Sex.MALE().toJSON())
        .should.be.exactly(author1.sex().toJSON())
        .and.exactly(author2.sex().toJSON());
    });

    it('should work with plain classes extending Modelico', () => {
      const animal = JSON.parse('{"name": "Sam"}', _(Animal).reviver);

      animal.speak().should.be.exactly('hello');
      animal.name().should.be.exactly('Sam');
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      });

      const author2 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      });

      const author3 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo Goñi',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY,
        importantDatesList: M.List.EMPTY,
        importantDatesSet: M.Set.EMPTY,
        sex: Sex.MALE()
      });

      author1.equals(author2).should.be.exactly(true);
      author1.equals(author3).should.be.exactly(false);

      author1.should.not.be.exactly(author2);
    });
  });

  describe('fields', () => {
    it('preserves undeclared properties', () => {
      const authorJson = '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);

      JSON.stringify(author).should.be.exactly('{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}');
    });
  });

  describe('circular innerTypes', () => {
    it('a Modelico type can have a key that is a Maybe of its own type', () => {
      const bestFriend = new Friend({
        name: 'John',
        bestFriend: M.Maybe.EMPTY
      });

      const marc = new Friend({
        name: 'Marc',
        bestFriend: M.Maybe.of(bestFriend)
      });

      marc
        .bestFriend().getOrElse(Friend.EMPTY)
        .name()
        .should.be.exactly('John');
    });
  });
};
