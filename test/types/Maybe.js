'use strict';

import PersonFactory from './fixtures/Person';
import PartOfDayFactory from './fixtures/PartOfDay';

export default (should, M) => () => {
  const PartOfDay = PartOfDayFactory(M);
  const Person = PersonFactory(M);
  const { _, asIs, maybe } = M.metadata;

  const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';

  describe('setting', () => {
    it('should set fields recursively returning a new Maybe', () => {
      const maybe1 = JSON.parse(authorJson, maybe(_(Person)).reviver);
      const maybe2 = maybe1.set('givenName', 'Javi');

      maybe2.inner().get().givenName()
        .should.be.exactly('Javi');
    });

    it('should not throw upon setting if empty', () => {
      const maybe = M.Maybe.of(null);

      maybe.set('givenName', 'Javier').isEmpty()
        .should.be.exactly(true);

      maybe.setPath(['lifeEvents', 'wedding'], new Date()).isEmpty()
        .should.be.exactly(true);
    });

    it('should return a new maybe with a value when the path is empty', () => {
      const maybe1 = M.Maybe.of(21);
      const maybe2 = M.Maybe.of(null);

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

    it('should return an empty Maybe when setting a path beyond Modelico boundaries', () => {
      const maybe1 = M.Maybe.of({a: 2});

      const maybe2 = maybe1.setPath(['a'], 200);

      maybe2.isEmpty()
        .should.be.exactly(true);
    });
  });

  describe('stringifying', () => {
    it('should stringify Maybe values correctly', () => {
      const maybe1 = M.Maybe.of(2);
      JSON.stringify(maybe1).should.be.exactly('2');

      const maybe2 = M.Maybe.of(null);
      JSON.stringify(maybe2).should.be.exactly('null');
    });

    it('should support arbitrary Modelico types', () => {
      const author = M.fromJSON(Person, authorJson);

      const maybe1 = M.Maybe.of(author);
      JSON.stringify(maybe1).should.be.exactly(authorJson);

      const maybe2 = M.Maybe.of(null);
      JSON.stringify(maybe2).should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const maybe1 = JSON.parse('2', maybe(asIs(Number)).reviver);
      should(maybe1.getOrElse(10)).be.exactly(2);

      const maybe2 = JSON.parse('null', maybe(asIs(Number)).reviver);
      maybe2.isEmpty().should.be.exactly(true);
    });

    it('should support arbitrary Modelico types', () => {
      const author = JSON.parse(authorJson, _(Person).reviver);

      const myMaybe = JSON.parse(authorJson, maybe(_(Person)).reviver);
      myMaybe.inner().get().equals(author).should.be.exactly(true);
    });

    it('should parse missing keys of Maybe values as Maybe with Nothing', () => {
      const authorJsonWithMissinMaybe = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[]}';

      const author = JSON.parse(authorJsonWithMissinMaybe, _(Person).reviver);

      author.sex().isEmpty()
        .should.be.exactly(true);
    });
  });

  describe('isEmpty', () => {
    it('should return false if there is a value', () => {
      const maybe = M.Maybe.of(5);

      maybe.isEmpty().should.be.exactly(false);
    });

    it('should return true if there is nothing', () => {
      const maybe1 = M.Maybe.of(null);
      const maybe2 = M.Maybe.of(undefined);
      const maybe3 = M.Maybe.of(NaN);

      maybe1.isEmpty().should.be.exactly(true);
      maybe2.isEmpty().should.be.exactly(true);
      maybe3.isEmpty().should.be.exactly(true);
    });
  });

  describe('getOrElse', () => {
    it('should return the value if it exists', () => {
      const maybe = M.Maybe.of(5);

      should(maybe.getOrElse(7)).be.exactly(5);
    });

    it('should return the provided default if there is nothing', () => {
      const maybe = M.Maybe.of(null);

      should(maybe.getOrElse(7)).be.exactly(7);
    });
  });

  describe('map', () => {
    const partOfDayFromJson = _(PartOfDay).reviver.bind(undefined, '');

    it('should apply a function f to the value and return another Maybe with it', () => {
      const maybeFrom1 = M.Maybe.of(5);
      const maybeFrom2 = M.Maybe.of('EVENING');

      const maybeTo1 = maybeFrom1.map(x => 2 * x);
      const maybeTo2 = maybeFrom2.map(partOfDayFromJson);

      should(maybeTo1.getOrElse(0)).be.exactly(10);
      should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(PartOfDay.EVENING());
    });

    it('should return a non-empty Maybe of whatever mapped function returns', () => {
      const maybeFrom1 = M.Maybe.of(null);
      const maybeFrom2 = M.Maybe.of(0);

      const maybeTo1 = maybeFrom1.map(x => 2 * x);
      const maybeTo2 = maybeFrom2.map(x => x / x);

      maybeTo1.isEmpty().should.be.exactly(true);
      maybeTo2.isEmpty().should.be.exactly(false);
    });

    it('should compose well', () => {
      const double = x => (x === null) ? 0 : 2 * x;
      const plus5 = x => (x === null) ? 5 : 5 + x;

      const mdouble = x => x.isEmpty() ? x : M.Maybe.of(double(x.inner().get()));
      const mplus5 = x => x.isEmpty() ? x : M.Maybe.of(plus5(x.inner().get()));

      should(mplus5(mdouble(M.Maybe.of(10))).inner().get())
        .be.exactly(M.Maybe.of(10).map(double).map(plus5).inner().get())
        .and.exactly(25);

      should(M.Maybe.of(10).map(x => null).map(plus5).inner().get())
        .be.exactly(5);
    });
  });
};
