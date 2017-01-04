/* eslint-env mocha */

import PersonFactory from './fixtures/Person'

export default (should, M) => () => {
  const Person = PersonFactory(M)
  const { _, date, set } = M.metadata

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Set(['a', 'b', 'c'])
      const set = M.Set.fromSet(input)

      input.delete('a')

      set.inner().has('a')
        .should.be.exactly(true)
    })
  })

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const set = M.Set.fromArray([1, 2, 2, 4]);

      [...set]
        .should.eql([1, 2, 4])
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse('null', set(date()).reviver))
        .should.throw()
    })

    it('should be able to set a whole set', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}'
      const author1 = JSON.parse(authorJson, _(Person).reviver)

      const date = M.Date.of(new Date('2016-05-03T00:00:00.000Z'))

      const author2 = author1.set(
        'importantDatesSet',
        M.Set.of(date)
      )

      const author1InnerSet = author1.importantDatesSet().inner()

      should(author1InnerSet.size).be.exactly(2)

      const author2InnerSet = author2.importantDatesSet().inner()

      should(author2InnerSet.size).be.exactly(1)
      author2InnerSet.has(date).should.be.exactly(true)
    })

    it('edge case when Set setPath is called with an empty path', () => {
      const modelicoDatesSet1 = M.Set.of(
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      )

      const modelicoDatesSet2 = new Set([
        M.Date.of(new Date('2016-04-16T00:00:00.000Z'))
      ])

      const listOfSetsOfDates1 = M.List.of(modelicoDatesSet1)
      const listOfSetsOfDates2 = listOfSetsOfDates1.setPath([0], modelicoDatesSet2)

      should([...[...listOfSetsOfDates1.inner()][0].inner()][0].inner().getFullYear())
        .be.exactly(1988)

      should([...[...listOfSetsOfDates2.inner()][0].inner()][0].inner().getFullYear())
        .be.exactly(2016)
    })

    it('should not support the set operation', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.set(0, 3))
        .should.throw()
    })

    it('should not support the setPath operation with non-empty paths', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.setPath([0], 3))
        .should.throw()
    })
  })

  describe('stringifying', () => {
    it('should stringify the set correctly', () => {
      const set = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date('2012-12-25T00:00:00.000Z'))
      ]

      const modelicoSet = M.Set.fromArray(set)

      JSON.stringify(modelicoSet)
        .should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]')
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Set(null))
        .should.throw()
    })
  })

  describe('parsing', () => {
    it('should parse the set correctly', () => {
      const modelicoSet = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        set(date()).reviver
      )

      should([...modelicoSet.inner()][0].inner().getFullYear())
        .be.exactly(1988)

      should([...modelicoSet.inner()][1].inner().getMonth())
        .be.exactly(11)
    })

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}'
      const author = JSON.parse(authorJson, _(Person).reviver)

      should([...author.importantDatesSet().inner()][0].inner().getFullYear())
        .be.exactly(2013)
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoSet1 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')))
      const modelicoSet2 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')))

      modelicoSet1.should.not.be.exactly(modelicoSet2)
      modelicoSet1.should.not.equal(modelicoSet2)

      modelicoSet1.equals(modelicoSet1).should.be.exactly(true)
      modelicoSet1.equals(modelicoSet2).should.be.exactly(true)

      modelicoSet1.equals(/abc/).should.be.exactly(false)
      M.Set.EMPTY().equals(modelicoSet1).should.be.exactly(false)
    })

    it('should have same-value-zero semantics', () => {
      M.Set.of(0).equals(M.Set.of(-0)).should.be.exactly(true)
      M.Set.of(NaN).equals(M.Set.of(NaN)).should.be.exactly(true)
    })
  })

  describe('EMPTY / of / fromArray / fromSet', () => {
    it('should have a static property for the empty set', () => {
      should(M.Set.EMPTY().inner().size)
        .be.exactly(0)

      M.Set.EMPTY().toJSON()
        .should.eql([])

      M.Set.of().should.be.exactly(M.Set.EMPTY())
    })

    it('should be able to create a set from arbitrary parameters', () => {
      const modelicoSet = M.Set.of(0, 1, 1, 2, 3, 5, 8);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8])
    })

    it('should be able to create a set from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8]

      const modelicoSet = M.Set.fromArray(fibArray);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8])
    })

    it('should be able to create a set from a native set', () => {
      const fibSet = new Set([0, 1, 1, 2, 3, 5, 8])

      const modelicoSet = M.Set.fromSet(fibSet);

      [...modelicoSet.inner()]
        .should.eql([0, 1, 2, 3, 5, 8])
    })
  })
}
