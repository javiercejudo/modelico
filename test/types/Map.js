/* eslint-env mocha */

export default (should, M, { Person }) => () => {
  const { date, map, number, string } = M.metadata()

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        ['A', 'Good morning!'],
        ['B', 'Good afternoon!'],
        ['C', 'Good evening!']
      ])

      const map = M.Map.fromMap(input)

      input.set('A', "g'day!")

      map.get('A')
        .should.be.exactly('Good morning!')
    })
  })

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const map = M.Map.fromObject({a: 1, b: 2, c: 3});

      [...map]
        .should.eql([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Map(null))
        .should.throw()
    })

    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date())]
      ])

      const modelicoMap1 = M.Map.fromMap(map)
      const modelicoMap2 = modelicoMap1.set('a', M.Date.of(new Date('1989-04-16T00:00:00.000Z')))

      should(modelicoMap2.inner().get('a').inner().getFullYear())
        .be.exactly(1989)

      // verify that modelicoMap1 was not mutated
      should(modelicoMap1.inner().get('a').inner().getFullYear())
        .be.exactly(1988)
    })

    it('should set fields returning a new map when part of a path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'
      const author1 = M.fromJSON(Person, authorJson)
      const author2 = author1.setIn(['lifeEvents', 'wedding'], new Date('2010-03-28T00:00:00.000Z'))

      should(author2.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2010)

      // verify that author1 was not mutated
      should(author1.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2013)
    })

    it('edge case when setIn is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'
      const author = M.fromJSON(Person, authorJson)

      const map = author.lifeEvents()

      should(map.inner().get('wedding').inner().getFullYear())
        .be.exactly(2013)

      const customMap = new Map([
        ['wedding', M.Date.of(new Date('2010-03-28T00:00:00.000Z'))]
      ])

      const map2 = map.setIn([], customMap)

      should(map2.inner().get('wedding').inner().getFullYear())
        .be.exactly(2010)
    })
  })

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]
      ])

      const modelicoMap = M.Map.fromMap(map)

      JSON.stringify(modelicoMap)
        .should.be.exactly('[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]')
    })
  })

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]',
        map(string(), date()).reviver
      )

      should(modelicoMap.inner().get('a').inner().getFullYear())
        .be.exactly(1988)

      should(modelicoMap.inner().get('b').inner().getMonth())
        .be.exactly(11)
    })

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'
      const author = M.fromJSON(Person, authorJson)

      should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013)
    })

    it('should be able to work with M.genericsFromJSON', () => {
      const myMap = M.genericsFromJSON(M.Map, [number(), string()], '[[1, "10"], [2, "20"], [3, "30"]]')

      myMap.inner().get(2)
        .should.be.exactly('20')
    })

    it('should be able to work with M.genericsFromJS', () => {
      const myMap = M.genericsFromJS(M.Map, [number(), string()], [[1, '10'], [2, '20'], [3, '30']])

      myMap.inner().get(2)
        .should.be.exactly('20')
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        map(string(), date()).reviver
      )).should.throw()
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = M.Map.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]))

      const modelicoMap2 = M.Map.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]))

      modelicoMap.should.not.be.exactly(modelicoMap2)
      modelicoMap.should.not.equal(modelicoMap2)

      modelicoMap.equals(modelicoMap).should.be.exactly(true)
      modelicoMap.equals(modelicoMap2).should.be.exactly(true)

      modelicoMap.equals(2).should.be.exactly(false)
      M.Map.EMPTY().equals(modelicoMap).should.be.exactly(false)
    })

    it('should have same-value-zero semantics', () => {
      M.Map.of('a', 0).equals(M.Map.of('a', -0)).should.be.exactly(true)
      M.Map.of('a', NaN).equals(M.Map.of('a', NaN)).should.be.exactly(true)

      M.Map.of(-0, 33).equals(M.Map.of(0, 33)).should.be.exactly(true)
    })

    it('should support simple unordered checks', () => {
      M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1))
        .should.be.exactly(false)

      M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1), true)
        .should.be.exactly(true)

      M.Map.of('a', 1, 'b', 2, 'c', undefined).equals(M.Map.of('b', 2, 'a', 1, 'd', 4), true)
        .should.be.exactly(false)
    })
  })

  describe('EMPTY / of / fromArray / fromObject / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.Map.EMPTY().inner().size)
        .be.exactly(0)

      M.Map.EMPTY().toJSON()
        .should.eql([])

      new M.Map()
        .should.be.exactly(M.Map.EMPTY())
    })

    it('should be able to create a map from an even number of params', () => {
      var map = M.Map.of('a', 1, 'b', 2, 'c', 3)

      should(map.inner().get('b')).be.exactly(2);

      (() => M.Map.of('a', 1, 'b', 2, 'c', 3, 'd'))
        .should.throw()
    })

    it('should be able to create a map from an array', () => {
      var map = M.Map.fromArray([['a', 1], ['b', 2], ['c', 3]])

      should(map.inner().get('b')).be.exactly(2)
    })

    it('should be able to create a map from an object', () => {
      var map = M.Map.fromObject({a: 1, b: 2, c: 3})

      should(map.inner().get('b')).be.exactly(2)
    })

    it('should be able to create a map from a native map', () => {
      var map = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]))

      should(map.inner().get('b')).be.exactly(2)
    })
  })

  describe('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Map.of())
        .should.be.exactly('[object ModelicoMap]')
    })
  })
}
