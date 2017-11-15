/* eslint-env mocha */

export default (U, should, M, {PartOfDay}) => () => {
  const {_, any, anyOf, enumMap, string} = M.metadata()

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ])

      const enumMap = M.EnumMap.fromMap(input)

      input.set(PartOfDay.MORNING(), "g'day!")

      enumMap
        .inner()
        .get(PartOfDay.MORNING())
        .should.be.exactly('Good morning!')
    })
  })

  describe('setting', () => {
    it('should set fields returning a new enum map', () => {
      const greetings1 = M.EnumMap.of(
        PartOfDay.MORNING(),
        'Good morning!',
        PartOfDay.AFTERNOON(),
        'Good afternoon!',
        PartOfDay.EVENING(),
        'Good evening!'
      )

      const greetings2 = greetings1.set(
        PartOfDay.AFTERNOON(),
        'GOOD AFTERNOON!'
      )

      greetings2
        .inner()
        .get(PartOfDay.AFTERNOON())
        .should.be.exactly('GOOD AFTERNOON!')

      greetings1
        .inner()
        .get(PartOfDay.AFTERNOON())
        .should.be.exactly('Good afternoon!')
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() => new M.EnumMap(null)).should.throw()
    })

    it('should set fields returning a new enum map when part of a path', () => {
      const map = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        [
          PartOfDay.AFTERNOON(),
          M.Date.of(new Date('2000-04-16T00:00:00.000Z'))
        ],
        [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]
      ])

      const greetings1 = M.EnumMap.fromMap(map)
      const greetings2 = greetings1.setIn(
        [PartOfDay.EVENING()],
        new Date('2013-04-16T00:00:00.000Z')
      )

      should(
        greetings2
          .inner()
          .get(PartOfDay.EVENING())
          .inner()
          .getFullYear()
      ).be.exactly(2013)

      should(
        greetings1
          .inner()
          .get(PartOfDay.EVENING())
          .inner()
          .getFullYear()
      ).be.exactly(2012)
    })

    it('edge case when setIn is called with an empty path', () => {
      const map1 = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        [
          PartOfDay.AFTERNOON(),
          M.Date.of(new Date('2000-04-16T00:00:00.000Z'))
        ],
        [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]
      ])

      const map2 = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1989-04-16T00:00:00.000Z'))],
        [
          PartOfDay.AFTERNOON(),
          M.Date.of(new Date('2001-04-16T00:00:00.000Z'))
        ],
        [PartOfDay.EVENING(), M.Date.of(new Date('2013-04-16T00:00:00.000Z'))]
      ])

      const greetings1 = M.EnumMap.fromMap(map1)
      const greetings2 = greetings1.setIn([], map2)

      should(
        greetings2
          .inner()
          .get(PartOfDay.EVENING())
          .inner()
          .getFullYear()
      ).be.exactly(2013)

      should(
        greetings1
          .inner()
          .get(PartOfDay.EVENING())
          .inner()
          .getFullYear()
      ).be.exactly(2012)
    })
  })

  describe('stringifying', () => {
    it('should stringify the enum map correctly', () => {
      const map = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ])

      const greetings = M.EnumMap.fromMap(map)

      JSON.stringify(greetings).should.be.exactly(
        '{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}'
      )
    })
  })

  describe('parsing', () => {
    it('should parse the enum map correctly', () => {
      const greetings = JSON.parse(
        '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}',
        enumMap(_(PartOfDay), any()).reviver
      )

      const greetingsAlt = JSON.parse(
        '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}',
        enumMap(() => _(PartOfDay), anyOf()).reviver
      )

      greetings.equals(greetingsAlt).should.be.exactly(true)

      greetings
        .inner()
        .get(PartOfDay.MORNING())
        .should.be.exactly('Good morning!')
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() =>
        JSON.parse(
          'null',
          enumMap(_(PartOfDay), string()).reviver
        )).should.throw()
    })
  })

  describe('EMPTY / of / fromArray / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.EnumMap.EMPTY().inner().size).be.exactly(0)

      M.EnumMap.EMPTY()
        .toJSON()
        .should.eql({})

      new M.EnumMap().should.be.exactly(M.EnumMap.EMPTY())
    })

    it('should be able to create an enum map from an even number of params', () => {
      var map = M.EnumMap.of(
        PartOfDay.MORNING(),
        1,
        PartOfDay.AFTERNOON(),
        2,
        PartOfDay.EVENING(),
        3
      )

      should(map.inner().get(PartOfDay.AFTERNOON())).be.exactly(2)
      ;(() =>
        M.EnumMap.of(
          PartOfDay.MORNING(),
          1,
          PartOfDay.AFTERNOON()
        )).should.throw()
    })

    it('should be able to create an enum map from an array', () => {
      var enumMap = M.EnumMap.fromArray([
        [PartOfDay.MORNING(), 1],
        [PartOfDay.AFTERNOON(), 2]
      ])

      should(enumMap.inner().get(PartOfDay.MORNING())).be.exactly(1)
    })

    it('should be able to create an enum map from a native map', () => {
      var enumMap = M.EnumMap.fromMap(
        new Map([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]])
      )

      should(enumMap.inner().get(PartOfDay.AFTERNOON())).be.exactly(2)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString
        .call(M.EnumMap.of())
        .should.be.exactly('[object ModelicoEnumMap]')
    })
  })
}
