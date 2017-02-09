/* eslint-env mocha */

export default (U, should, M, { Person }) => () => {
  const { _, list, date } = M.metadata()

  describe('immutability', () => {
    U.skipIfNoObjectFreeze('must freeze the input', () => {
      const input = ['a', 'b', 'c']

      M.List.fromArray(input)

      ;(() => { input[1] = 'B' })
        .should.throw()
    })
  })

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      (() => M.List()).should.throw()
    })
  })

  describe('get', () => {
    it('should return the nth item', () => {
      M.List.of('a', 'b', 'c').get(1)
        .should.be.exactly('b')
    })
  })

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const list = M.List.fromArray([1, 2, 3, 4])

      Array.from(list)
        .should.eql([1, 2, 3, 4])
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.List(null))
        .should.throw()
    })

    it('should set items in the list correctly', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ]

      const modelicoList1 = M.List.fromArray(list)
      const modelicoList2 = modelicoList1.set(0, M.Date.of(new Date('1989-04-16T00:00:00.000Z')))

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(1989)

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988)
    })

    it('should set items in the list correctly when part of a path', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ]

      const modelicoList1 = M.List.fromArray(list)
      const modelicoList2 = modelicoList1.setIn([0], new Date('1989-04-16T00:00:00.000Z'))

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(1989)

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988)
    })

    it('should set items in the list correctly when part of a path with a single element', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ]

      const modelicoList1 = M.List.fromArray(list)
      const modelicoList2 = modelicoList1.setIn([0], new Date('2000-04-16T00:00:00.000Z'))

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(2000)

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988)
    })

    it('should be able to set a whole list', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'
      const author1 = JSON.parse(authorJson, _(Person).reviver)

      const newListArray = [...author1.importantDatesList()]
      newListArray.splice(1, 0, M.Date.of(new Date('2016-05-03T00:00:00.000Z')))

      const author2 = author1.set(
        'importantDatesList',
        M.List.fromArray(newListArray)
      )

      should(author1.importantDatesList().size).be.exactly(2)
      should(author1.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013)
      should(author1.importantDatesList().get(1).inner().getFullYear()).be.exactly(2012)

      should([...author2.importantDatesList()].length).be.exactly(3)
      should(author2.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013)
      should(author2.importantDatesList().get(1).inner().getFullYear()).be.exactly(2016)
      should(author2.importantDatesList().get(2).inner().getFullYear()).be.exactly(2012)
    })

    it('edge case when List setIn is called with an empty path', () => {
      const modelicoDatesList1 = M.List.of(
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      )

      const modelicoDatesList2 = [
        M.Date.of(new Date('2016-04-16T00:00:00.000Z'))
      ]

      const listOfListOfDates1 = M.List.of(modelicoDatesList1)
      const listOfListOfDates2 = listOfListOfDates1.setIn([0], modelicoDatesList2)

      should(listOfListOfDates1.get(0).get(0).inner().getFullYear())
        .be.exactly(1988)

      should(listOfListOfDates2.get(0).get(0).inner().getFullYear())
        .be.exactly(2016)
    })
  })

  describe('stringifying', () => {
    it('should stringify the list correctly', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date('2012-12-25T00:00:00.000Z'))
      ]

      const modelicoList = M.List.fromArray(list)

      JSON.stringify(modelicoList)
        .should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]')
    })
  })

  describe('parsing', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        list(date()).reviver
      )

      should(modelicoList.get(0).inner().getFullYear())
        .be.exactly(1988)

      should(modelicoList.get(1).inner().getMonth())
        .be.exactly(11)
    })

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'
      const author = JSON.parse(authorJson, _(Person).reviver)

      should(author.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013)
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse('null', list(date()).reviver))
        .should.throw()
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoList1 = M.List.of(1, 2, 3)
      const modelicoList2 = M.List.of(1, 2, 3)

      modelicoList1.should.not.be.exactly(modelicoList2)
      modelicoList1.should.not.equal(modelicoList2)

      modelicoList1.equals(modelicoList1).should.be.exactly(true)
      modelicoList1.equals(modelicoList2).should.be.exactly(true)

      modelicoList1.equals(() => 1).should.be.exactly(false)
      M.List.EMPTY().equals(modelicoList1).should.be.exactly(false)
    })

    it('should support non-primitive types', () => {
      const modelicoList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')))
      const modelicoList2 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')))

      modelicoList1.should.not.be.exactly(modelicoList2)
      modelicoList1.should.not.equal(modelicoList2)

      modelicoList1.equals(modelicoList1).should.be.exactly(true)
      modelicoList1.equals(modelicoList2).should.be.exactly(true)

      M.List.of(2, 4).equals(M.Set.of(2, 4)).should.be.exactly(false)
      M.List.of(2, 4).equals(M.List.of(4, 2)).should.be.exactly(false)
    })

    it('should have same-value-zero semantics', () => {
      M.List.of(0).equals(M.List.of(-0)).should.be.exactly(true)
      M.List.of(NaN).equals(M.List.of(NaN)).should.be.exactly(true)
    })
  })

  describe('EMPTY / of / fromArray', () => {
    it('should have a static property for the empty list', () => {
      should([...M.List.EMPTY()].length)
        .be.exactly(0)

      M.List.EMPTY().toJSON()
        .should.eql([])

      new M.List()
        .should.be.exactly(M.List.EMPTY())
    })

    it('should be able to create a list from arbitrary parameters', () => {
      const modelicoList = M.List.of(0, 1, 1, 2, 3, 5, 8)

      Array.from(modelicoList)
        .should.eql([0, 1, 1, 2, 3, 5, 8])
    })

    it('should be able to create a list from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8]

      const modelicoList = M.List.fromArray(fibArray)

      Array.from(modelicoList)
        .should.eql([0, 1, 1, 2, 3, 5, 8])
    })
  })

  describe('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.List.of())
        .should.be.exactly('[object ModelicoList]')
    })
  })
}
