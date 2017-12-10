/* eslint-env mocha */

export default (U, should, M, {Person, PartOfDay}) => () => {
  const {_, number, maybe} = M.metadata()

  const authorJson =
    '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}'

  describe('setting', () => {
    it('should set fields recursively returning a new Maybe', () => {
      const maybe1 = JSON.parse(authorJson, maybe(_(Person)).reviver)
      const maybe2 = maybe1.set('givenName', 'Javi')

      maybe2
        .getOrElse('')
        .givenName()
        .should.be.exactly('Javi')
    })

    it('should not throw upon setting if empty', () => {
      const maybe = M.Maybe.of(null)

      maybe
        .set('givenName', 'Javier')
        .isEmpty()
        .should.be.exactly(true)
    })

    it('should return a new maybe with a value when the path is empty', () => {
      const maybe1 = M.Just.of(21)
      const maybe2 = M.Nothing

      const maybe3 = maybe1.setIn([], 22)
      const maybe4 = maybe2.setIn([], 10)
      const maybe5 = maybe2.setIn([], null)

      should(maybe3.getOrElse(0)).be.exactly(22)

      should(maybe4.getOrElse(2)).be.exactly(10)

      should(maybe5.getOrElse(2)).be.exactly(2)
    })

    it('should return an empty Maybe when setting a path beyond Modelico boundaries', () => {
      const maybe1 = M.Just.of({a: 2})
      const maybe2 = maybe1.setIn([[{a: 1}, 'a']], 200)

      maybe2.isEmpty().should.be.exactly(true)
      M.Just.of(2)
        .set('a', 3)
        .isEmpty()
        .should.be.exactly(true)
    })

    it('should support Maybe of null or undefined', () => {
      should(
        M.Just.of(null)
          .setIn([], 2)
          .toJSON()
      ).be.exactly(2)
      should(
        M.Just.of(null)
          .set('a', 2)
          .getOrElse('')
      ).be.exactly(null)
      should(
        M.Just.of()
          .set('a', 2)
          .getOrElse('')
      ).be.exactly(undefined)
    })
  })

  describe('stringifying', () => {
    it('should stringify Maybe values correctly', () => {
      const maybe1 = M.Just.of(2)
      JSON.stringify(maybe1).should.be.exactly('2')

      const maybe2 = M.Nothing
      JSON.stringify(maybe2).should.be.exactly('null')
    })

    it('should support arbitrary Modelico types', () => {
      const author = M.fromJSON(Person, authorJson)
      const maybe1 = M.Just.of(author)
      JSON.stringify(maybe1).should.be.exactly(authorJson)

      const maybe2 = M.Nothing
      JSON.stringify(maybe2).should.be.exactly('null')
    })

    it('should support Maybe of null or undefined', () => {
      JSON.stringify(M.Just.of(null)).should.be.exactly('null')
      JSON.stringify(M.Just.of()).should.be.exactly('null')
    })
  })

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const maybe1 = JSON.parse('2', maybe(number()).reviver)
      should(maybe1.getOrElse(10)).be.exactly(2)

      const maybe2 = JSON.parse('null', maybe(number()).reviver)
      maybe2.isEmpty().should.be.exactly(true)

      const maybe3 = M.genericsFromJS(M.Maybe, [() => number()], 5)
      should(maybe3.getOrElse(0)).be.exactly(5)
    })

    it('should support arbitrary Modelico types', () => {
      const author = JSON.parse(authorJson, _(Person).reviver)
      const myMaybe = JSON.parse(authorJson, maybe(_(Person)).reviver)

      myMaybe
        .inner()
        .equals(author)
        .should.be.exactly(true)
    })

    it('should parse missing keys of Maybe values as Maybe with Nothing', () => {
      const authorJsonWithMissinMaybe =
        '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[]}'

      const author = JSON.parse(authorJsonWithMissinMaybe, _(Person).reviver)
      author
        .sex()
        .isEmpty()
        .should.be.exactly(true)
    })

    it('should handle missing Enums', () => {
      const MyEnum = M.Enum.fromArray(['A', 'B'])
      const m = M.metadata()

      m
        .maybe(MyEnum.metadata())
        .reviver('', 'C')
        .should.be.exactly(M.Nothing)
      m
        .maybe(MyEnum.metadata())
        .reviver('', null)
        .should.be.exactly(M.Nothing)
    })
  })

  describe('Nothing', () => {
    it('holds no value', () => {
      should(() => M.Maybe.of().inner()).throw('nothing holds no value')
    })

    it('generates a Nothing when used with Maybe.of', () => {
      M.Maybe.of(M.Nothing).should.be.exactly(M.Nothing)
    })

    it('can be contained in a Just like everything else', () => {
      M.Just.of(M.Nothing)
        .inner()
        .should.be.exactly(M.Nothing)
    })
  })

  describe('isEmpty', () => {
    it('should return false if there is a value', () => {
      const maybe = M.Just.of(5)
      maybe.isEmpty().should.be.exactly(false)
    })

    it('should return true if there is nothing', () => {
      const maybe1 = M.Maybe.of(null)
      const maybe2 = M.Maybe.of(undefined)
      const maybe3 = M.Maybe.of(NaN)

      maybe1.isEmpty().should.be.exactly(true)
      maybe2.isEmpty().should.be.exactly(true)
      maybe3.isEmpty().should.be.exactly(true)
    })
  })

  describe('getOrElse', () => {
    it('should return the value if it exists', () => {
      const maybe = M.Just.of(5)
      should(maybe.getOrElse(7)).be.exactly(5)
    })

    it('should return the provided default if there is nothing', () => {
      const maybe = M.Nothing
      should(maybe.getOrElse(7)).be.exactly(7)
    })
  })

  describe('map', () => {
    const partOfDayFromJson = _(PartOfDay).reviver.bind(undefined, '')

    it('should apply a function f to the value and return another Maybe with it', () => {
      const maybeFrom1 = M.Just.of(5)
      const maybeFrom2 = M.Just.of('EVENING')

      const maybeTo1 = maybeFrom1.map(x => 2 * x)
      const maybeTo2 = maybeFrom2.map(partOfDayFromJson)

      should(maybeTo1.getOrElse(0)).be.exactly(10)

      should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(
        PartOfDay.EVENING()
      )
    })

    it('should return a non-empty Maybe of whatever mapped function returns', () => {
      const maybeFrom1 = M.Nothing
      const maybeFrom2 = M.Just.of(0)

      const maybeTo1 = maybeFrom1.map(x => 2 * x)
      const maybeTo2 = maybeFrom2.map(x => x / x)

      maybeTo1.isEmpty().should.be.exactly(true)
      maybeTo2.isEmpty().should.be.exactly(false)
    })

    it('should compose well', () => {
      const double = x => (x === null ? 0 : 2 * x)
      const plus5 = x => (x === null ? 5 : 5 + x)
      const doublePlus5 = x => plus5(double(x))
      const just10 = M.Just.of(10)

      should(just10.map(doublePlus5).inner())
        .be.exactly(
          just10
            .map(double)
            .map(plus5)
            .inner()
        )
        .and.exactly(25)

      should(
        just10
          .map(() => null)
          .map(plus5)
          .inner()
      ).be.exactly(5)
    })
  })

  describe('flatMap', () => {
    it('should not wrap the result for easier Maybe chaining', () => {
      const just5 = M.Just.of(5)
      const just10 = M.Just.of(10)

      const addMaybes = (mX, mY) => mX.flatMap(x => mY.map(y => x + y))

      addMaybes(just5, just10)
        .getOrElse(0)
        .should.be.exactly(15)
      addMaybes(M.Nothing, just10)
        .getOrElse(0)
        .should.be.exactly(0)
      addMaybes(just5, M.Nothing)
        .getOrElse(0)
        .should.be.exactly(0)
      addMaybes(M.Nothing, M.Nothing)
        .getOrElse(0)
        .should.be.exactly(0)
    })

    it('should throw a TypeError if f does not return a Maybe', () => {
      should(() => M.Just.of(5).flatMap(x => 10 + x)).throw(
        'Maybe.flatMap expects a Maybe-returning function'
      )
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMaybe1 = M.Just.of(2)
      const modelicoMaybe2 = M.Just.of(2)

      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2)
      modelicoMaybe1.should.not.equal(modelicoMaybe2)

      modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true)
      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true)
    })

    it('supports non-primitive types', () => {
      const modelicoMaybe1 = M.Just.of(M.Number.of(2))
      const modelicoMaybe2 = M.Just.of(M.Number.of(2))
      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2)
      modelicoMaybe1.should.not.equal(modelicoMaybe2)
      modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true)
      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true)
      modelicoMaybe1.equals(null).should.be.exactly(false)
      modelicoMaybe1.equals().should.be.exactly(false)
    })

    it('handles nothing well', () => {
      const modelicoMaybe1 = M.Just.of(M.Number.of(2))
      const modelicoMaybe2 = M.Nothing
      const modelicoMaybe3 = M.Maybe.of()

      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2)
      modelicoMaybe1.should.not.equal(modelicoMaybe2)

      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(false)
      modelicoMaybe2.equals(modelicoMaybe3).should.be.exactly(true)
    })

    it('should have same-value-zero semantics', () => {
      M.Just.of(0)
        .equals(M.Just.of(-0))
        .should.be.exactly(true)
      M.Just.of(NaN)
        .equals(M.Just.of(NaN))
        .should.be.exactly(true)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString
        .call(M.Just.of(1))
        .should.be.exactly('[object ModelicoJust]')

      Object.prototype.toString
        .call(M.Nothing)
        .should.be.exactly('[object ModelicoNothing]')
    })
  })
}
