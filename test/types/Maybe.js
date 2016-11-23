'use strict';

import PersonFactory from './fixtures/Person';
import PartOfDayFactory from './fixtures/PartOfDay';

export default (should, M) => () => {
  const PartOfDay = PartOfDayFactory(M);
  const Person = PersonFactory(M);
  const Modelico = M.Modelico;

  const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';

  describe('setting', () => {
    it('should set fields recursively returning a new Maybe', () => {
      const maybe1 = JSON.parse(authorJson, M.Maybe.metadata(Person.metadata()).reviver);
      const maybe2 = maybe1.set('givenName', 'Javi');

      maybe2.inner().get().givenName()
        .should.be.exactly('Javi');
    });

    it('should set fields recursively returning a new Maybe', () => {
      const maybe1 = JSON.parse(authorJson, M.Maybe.metadata(Person.metadata()).reviver);
      const maybe2 = maybe1.set('givenName', 'Javi');

      maybe2.inner().get().givenName()
        .should.be.exactly('Javi');
    });

    it('should not throw upon setting if empty', () => {
      const maybe = new M.Maybe(Person.metadata(), null);

      maybe.set('givenName', 'Javier').isEmpty()
        .should.be.exactly(true);

      maybe.setPath(['lifeEvents', 'wedding'], new Date()).isEmpty()
        .should.be.exactly(true);
    });

    it('should return a new maybe with a value when the path is empty', () => {
      const maybe1 = new M.Maybe(M.AsIs(Number), 21);
      const maybe2 = new M.Maybe(M.AsIs(Number), null);

      const maybe3 = maybe1.setPath([], 22);
      const maybe4 = maybe2.setPath([], 10);
      const maybe5 = maybe2.setPath([], null);

      should(maybe3.getOrElse(0))
        .be.exactly(22);

      should(maybe4.getOrElse(2))
        .be.exactly(10);

      should(maybe5.getOrElse(2))
        .be.exactly(2);
    });
  });

  describe('stringifying', () => {
    it('should stringify Maybe values correctly', () => {
      const maybe1 = new M.Maybe(M.AsIs(Number), 2);
      JSON.stringify(maybe1).should.be.exactly('2');

      const maybe2 = new M.Maybe(M.AsIs(Number), null);
      JSON.stringify(maybe2).should.be.exactly('null');
    });

    it('should support arbitrary Modelico types', () => {
      const author = Modelico.fromJSON(Person, authorJson);

      const maybe1 = new M.Maybe(Person.metadata(), author);
      JSON.stringify(maybe1).should.be.exactly(authorJson);

      const maybe2 = new M.Maybe(Person.metadata(), null);
      JSON.stringify(maybe2).should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const maybe1 = JSON.parse('2', M.Maybe.metadata(M.AsIs(Number)).reviver);
      should(maybe1.getOrElse(10)).be.exactly(2);

      const maybe2 = JSON.parse('null', M.Maybe.metadata(M.AsIs(Number)).reviver);
      maybe2.isEmpty().should.be.exactly(true);
    });

    it('should support arbitrary Modelico types', () => {
      const author = JSON.parse(authorJson, Person.metadata().reviver);

      const maybe = JSON.parse(authorJson, M.Maybe.metadata(Person.metadata()).reviver);
      maybe.inner().get().equals(author).should.be.exactly(true);
    });
  });

  describe('isEmpty', () => {
    it('should return false if there is a value', () => {
      const maybe = new M.Maybe(M.AsIs(Number), 5);

      maybe.isEmpty().should.be.exactly(false);
    });

    it('should return true if there is nothing', () => {
      const maybe1 = new M.Maybe(M.AsIs(Number), null);
      const maybe2 = new M.Maybe(M.AsIs(Number), undefined);
      const maybe3 = new M.Maybe(M.AsIs(Number), NaN);

      maybe1.isEmpty().should.be.exactly(true);
      maybe2.isEmpty().should.be.exactly(true);
      maybe3.isEmpty().should.be.exactly(true);
    });
  });

  describe('getOrElse', () => {
    it('should return the value if it exists', () => {
      const maybe = new M.Maybe(M.AsIs(Number), 5);

      should(maybe.getOrElse(7)).be.exactly(5);
    });

    it('should return the provided default if there is nothing', () => {
      const maybe = new M.Maybe(M.AsIs(Number), null);

      should(maybe.getOrElse(7)).be.exactly(7);
    });
  });

  describe('map', () => {
    const partOfDayFromJson = PartOfDay.metadata().reviver.bind(undefined, '');

    it('should apply a function f to the value and return another Maybe with it', () => {
      const maybeFrom1 = new M.Maybe(M.AsIs(Number), 5);
      const maybeFrom2 = new M.Maybe(M.AsIs(String), 'EVENING');

      const maybeTo1 = maybeFrom1.map(M.AsIs(Number), x => 2 * x);
      const maybeTo2 = maybeFrom2.map(PartOfDay.metadata(), partOfDayFromJson);

      should(maybeTo1.getOrElse(0)).be.exactly(10);
      should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(PartOfDay.EVENING());
    });

    it('should return an empty Maybe if there was nothing', () => {
      const maybeFrom1 = new M.Maybe(M.AsIs(Number), null);
      const maybeFrom2 = new M.Maybe(M.AsIs(Number), 0);

      const maybeTo1 = maybeFrom1.map(M.AsIs(Number), x => 2 * x);
      const maybeTo2 = maybeFrom2.map(M.AsIs(Number), x => x / x);

      maybeTo1.isEmpty().should.be.exactly(true);
      maybeTo2.isEmpty().should.be.exactly(true);
    });
  });
};
