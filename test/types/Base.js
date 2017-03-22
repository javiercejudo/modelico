/* eslint-env mocha */

export default (U, should, M, fixtures) => () => {
  const {
    Person,
    PartOfDay,
    Sex,
    Animal,
    Friend
  } = fixtures

  const { _, maybe, number, string, withDefault } = M.metadata()
  const ModelicoDate = M.Date

  const author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'
  const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}'

  describe('immutability', () => {
    it('must freeze wrapped input', () => {
      const authorFields = {
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      }

      const author = new Person(authorFields)

      should(() => { authorFields.givenName = 'Javi' })
        .throw()

      author.givenName()
        .should.be.exactly('Javier')
    })
  })

  describe('innerTypes check', () => {
    class Country extends M.Base {
      constructor (code) {
        super(Country, {code})
      }
    }

    it('should throw when static innerTypes are missing', () => {
      (() => M.fromJSON(Country, '"ESP"'))
        .should.throw(/missing static innerTypes/)
    })
  })

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      should(() => M.fromJSON(Person, author2Json))
        .throw()

      should(() => new Person(null))
        .throw()
    })

    it('should set fields returning a new object', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      // sanity check
      JSON.stringify(author1)
        .should.be.exactly(author1Json)

      author1.givenName().should.be.exactly('Javier')

      // field setting
      const author2 = author1.set('givenName', 'Javi')

      // repeat sanity check
      author1.givenName().should.be.exactly('Javier')

      JSON.stringify(author1)
        .should.be.exactly(author1Json)

      // new object checks
      should(author2 === author1).be.exactly(false)
      author2.givenName().should.be.exactly('Javi')
      author2.equals(author1).should.be.exactly(false, 'Oops, they are equal')
    })

    it('should support creating a copy with updated fields', () => {
      class Book extends M.createModel({
        title: string(),
        year: maybe(number()),
        author: withDefault(string(), 'anonymous')
      }) {
        constructor (fields) {
          super(Book, fields)
        }
      }

      const book1 = new Book({
        title: 'El Guitarrista',
        year: M.Maybe.of(2002),
        author: 'Luis Landero'
      })

      const book2 = book1.copy({
        title: 'O Homem Duplicado',
        author: 'José Saramago'
      })

      book1.title().should.be.exactly('El Guitarrista')
      book2.title().should.be.exactly('O Homem Duplicado')

      should(book1.year().getOrElse(2017)).be.exactly(2002)
      should(book2.year().getOrElse(2017)).be.exactly(2002)
    })

    it('should set fields recursively returning a new object', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      const author2 = author1.setIn(['givenName'], 'Javi')
        .setIn(['birthday'], new Date('1989-04-16T00:00:00.000Z'))

      should(author2.birthday().inner().getFullYear())
        .be.exactly(1989)

      // verify that the original author1 was not mutated
      should(author1.birthday().inner().getFullYear())
        .be.exactly(1988)
    })

    it('edge case when Modélico setIn is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'
      const author = JSON.parse(authorJson, _(Person).reviver)
      const listOfPeople1 = M.List.of(author)

      const listOfPeople2 = listOfPeople1.setIn([0, 'givenName'], 'Javi')
      const listOfPeople3 = listOfPeople2.setIn([0], M.fields(author))

      listOfPeople1.get(0).givenName().should.be.exactly('Javier')
      listOfPeople2.get(0).givenName().should.be.exactly('Javi')
      listOfPeople3.get(0).givenName().should.be.exactly('Javier')
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: null,
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })).should.throw()
    })
  })

  describe('toJS', () => {
    it('should return as primitives or arrays or objects only', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      author1.toJS().should.eql({
        birthday: '1988-04-16T00:00:00.000Z',
        familyName: 'Cejudo',
        favouritePartOfDay: 'EVENING',
        givenName: 'Javier',
        importantDatesList: [],
        importantDatesSet: [],
        lifeEvents: [],
        sex: 'MALE'
      })
    })
  })

  describe('fromJS', () => {
    it('should parse from primitives, arrays or objects only', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      M.fromJS(Person, {
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: '1988-04-16T00:00:00.000Z',
        favouritePartOfDay: 'EVENING',
        lifeEvents: [],
        importantDatesList: [],
        importantDatesSet: [],
        sex: 'MALE'
      }).equals(author1).should.be.exactly(true)
    })
  })

  describe('stringifying', () => {
    it('should stringify types correctly', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      JSON.stringify(author1)
        .should.be.exactly(author1Json)
        .and.exactly(author1.stringify())
    })
  })

  describe('parsing', () => {
    it('should parse types correctly', () => {
      const author1 = M.fromJSON(Person, author1Json)
      const author2 = JSON.parse(author1Json, _(Person).reviver)

      'Javier Cejudo'
        .should.be.exactly(author1.fullName())
        .and.exactly(author2.fullName())

      should(1988)
        .be.exactly(author1.birthday().inner().getFullYear())
        .and.exactly(author2.birthday().inner().getFullYear())

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author1.favouritePartOfDay().minTime)
        .and.exactly(author2.favouritePartOfDay().minTime)

      should(Sex.MALE().toJSON())
        .be.exactly(author1.sex().toJSON())
        .and.exactly(author2.sex().toJSON())
    })

    it('should work with plain classes extending Modélico', () => {
      const animal = JSON.parse('{"name": "Sam"}', _(Animal).reviver)

      animal.speak().should.be.exactly('hello')
      animal.name().should.be.exactly('Sam')
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        sex: M.Maybe.of(Sex.MALE()),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY()
      })

      const author2 = new Person({
        familyName: 'Cejudo',
        givenName: 'Javier',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      const author3 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo Goñi',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      const author4 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY()
      })

      const author5 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        extra: 1
      })

      author1.equals(author1).should.be.exactly(true)
      author1.equals(author2).should.be.exactly(true)
      author1.equals(author3).should.be.exactly(false)
      author1.equals(author4).should.be.exactly(false)
      author1.equals(author5).should.be.exactly(false)
      author1.equals(2).should.be.exactly(false)

      author1.should.not.be.exactly(author2)
    })
  })

  describe('fields', () => {
    it('preserves undeclared properties', () => {
      const authorJson = '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'
      const author = JSON.parse(authorJson, _(Person).reviver)

      JSON.stringify(author).should.be.exactly('{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}')
    })
  })

  describe('circular innerTypes', () => {
    it('a Modélico type can have a key that is a Maybe of its own type', () => {
      const bestFriend = new Friend({
        name: 'John',
        bestFriend: M.Maybe.of()
      })

      const marc = new Friend({
        name: 'Marc',
        bestFriend: M.Maybe.of(bestFriend)
      })

      marc
        .bestFriend().getOrElse(Friend.EMPTY)
        .name()
        .should.be.exactly('John')
    })
  })

  describe('withDefault', () => {
    it('should allow enhancing metadata to have default values', () => {
      class Book extends M.createModel({
        title: string(),
        author: withDefault(string(), 'anonymous')
      }, 'Book') {
        constructor (props) {
          super(Book, props)
        }

        getTitleBy () {
          return `"${this.title()}" by ${this.author()}`
        }

        static innerTypes () {
          return super.innerTypes()
        }
      }

      const lazarillo1 = M.fromJS(Book, {
        title: 'Lazarillo de Tormes'
      })

      lazarillo1.getTitleBy()
        .should.be.exactly('"Lazarillo de Tormes" by anonymous')

      const lazarillo2 = new Book({
        title: 'Lazarillo de Tormes'
      })

      lazarillo2.getTitleBy()
        .should.be.exactly('"Lazarillo de Tormes" by anonymous')
    })
  })

  describe('withDefault', () => {
    it('should use the metadata to coerce the value if necessary', () => {
      class CountryCallingCode extends M.createModel(() => ({
        code: withDefault(number(), '34')
      })) {
        constructor (props) {
          super(CountryCallingCode, props)
        }

        static innerTypes () {
          return super.innerTypes()
        }
      }

      const spain = M.fromJS(CountryCallingCode, {})

      spain.code()
        .should.be.exactly(34)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should use the metadata to coerce the value if necessary', () => {
      class CountryCallingCode extends M.createModel(() => ({
        code: withDefault(number(), '34')
      })) {
        constructor (props) {
          super(CountryCallingCode, props)
        }

        static innerTypes () {
          return super.innerTypes()
        }
      }

      const spain = M.fromJS(CountryCallingCode, {})

      Object.prototype.toString.call(spain)
        .should.be.exactly('[object ModelicoModel]')
    })

    it('should implement Symbol.toStringTag', () => {
      const author1 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Maybe.of(Sex.MALE())
      })

      Object.prototype.toString.call(author1)
        .should.be.exactly('[object ModelicoModel]')
    })
  })
}
