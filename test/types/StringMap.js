/* eslint-env mocha */

export default (should, M, {Person}) => () => {
  const {date, number, stringMap} = M.metadata()

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        ['A', 'Good morning!'],
        ['B', 'Good afternoon!'],
        ['C', 'Good evening!']
      ])

      const map = M.StringMap.fromMap(input)

      input.set('A', "g'day!")

      map
        .inner()
        .get('A')
        .should.be.exactly('Good morning!')
    })
  })

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const map = M.StringMap.fromObject({a: 1, b: 2, c: 3})

      map.toJSON().should.eql({a: 1, b: 2, c: 3})
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() => new M.StringMap(null)).should.throw()
    })

    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date())]
      ])

      const modelicoMap1 = M.StringMap.fromMap(map)
      const modelicoMap2 = modelicoMap1.set(
        'a',
        M.Date.of(new Date('1989-04-16T00:00:00.000Z'))
      )

      should(
        modelicoMap2
          .inner()
          .get('a')
          .inner()
          .getFullYear()
      ).be.exactly(1989)

      // verify that modelicoMap1 was not mutated
      should(
        modelicoMap1
          .inner()
          .get('a')
          .inner()
          .getFullYear()
      ).be.exactly(1988)
    })
  })

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]
      ])

      const modelicoMap = M.StringMap.fromMap(map)

      JSON.stringify(modelicoMap).should.be.exactly(
        '{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}'
      )
    })
  })

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}',
        stringMap(date()).reviver
      )

      const modelicoMapAlt = JSON.parse(
        '{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}',
        stringMap(() => date()).reviver
      )

      modelicoMap.equals(modelicoMapAlt).should.be.exactly(true)

      should(
        modelicoMap
          .inner()
          .get('a')
          .inner()
          .getFullYear()
      ).be.exactly(1988)

      should(
        modelicoMap
          .inner()
          .get('b')
          .inner()
          .getMonth()
      ).be.exactly(11)
    })

    it('should be parsed correctly when used within another class', () => {
      const authorJson =
        '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'
      const author = M.fromJSON(Person, authorJson)

      should(
        author
          .lifeEvents()
          .inner()
          .get('wedding')
          .inner()
          .getFullYear()
      ).be.exactly(2013)
    })

    it('should be able to work with M.genericsFromJSON', () => {
      const myMap = M.genericsFromJSON(
        M.StringMap,
        [number()],
        '{"1":10,"2":20,"3":30}'
      )

      should(myMap.inner().get('2')).be.exactly(20)
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() => JSON.parse('null', stringMap(date()).reviver)).should.throw()
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = M.StringMap.fromMap(
        new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]])
      )

      const modelicoMap2 = M.StringMap.fromMap(
        new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]])
      )

      modelicoMap.should.not.be.exactly(modelicoMap2)
      modelicoMap.should.not.equal(modelicoMap2)

      modelicoMap.equals(modelicoMap).should.be.exactly(true)
      modelicoMap.equals(modelicoMap2).should.be.exactly(true)

      modelicoMap.equals(2).should.be.exactly(false)
      M.StringMap.EMPTY()
        .equals(modelicoMap)
        .should.be.exactly(false)
    })

    it('should have same-value-zero semantics', () => {
      M.StringMap.of('a', 0)
        .equals(M.StringMap.of('a', -0))
        .should.be.exactly(true)
      M.StringMap.of('a', NaN)
        .equals(M.StringMap.of('a', NaN))
        .should.be.exactly(true)
    })
  })

  describe('EMPTY / of / fromArray / fromObject / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.StringMap.EMPTY().inner().size).be.exactly(0)

      M.StringMap.EMPTY()
        .toJSON()
        .should.eql({})
    })

    it('should be able to create a map from an even number of params', () => {
      var map = M.StringMap.of('a', 1, 'b', 2, 'c', 3)

      should(map.inner().get('b')).be.exactly(2)
      ;(() => M.StringMap.of('a', 1, 'b', 2, 'c', 3, 'd')).should.throw()
    })

    it('should be able to create a map from an array', () => {
      var map = M.StringMap.fromArray([['a', 1], ['b', 2], ['c', 3]])

      should(map.inner().get('b')).be.exactly(2)
    })

    it('should be able to create a map from an object', () => {
      var map = M.StringMap.fromObject({a: 1, b: 2, c: 3})

      should(map.inner().get('b')).be.exactly(2)
    })

    it('should be able to create a map from a native map', () => {
      var map = M.StringMap.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]))

      should(map.inner().get('b')).be.exactly(2)
    })
  })
}
