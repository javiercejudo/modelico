/* eslint-env mocha */

export default (U, should, M, fixtures) => () => {
  const {Person, PartOfDay, Sex, Animal, Friend} = fixtures
  const {_, number, withDefault} = M.metadata()
  const ModelicoDate = M.Date

  const author1Json =
    '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}'

  const author2Json =
    '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}'

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
        sex: M.Just.of(Sex.MALE())
      }

      const author = new Person(authorFields)

      should(() => {
        authorFields.givenName = 'Javi'
      }).throw()

      author.givenName().should.be.exactly('Javier')
    })
  })

  describe('default innerTypes', () => {
    class Country extends M.Base {
      constructor(props) {
        super(Country, props)
      }
    }

    it('should not throw when static innerTypes are missing', () => {
      should(() => M.fromJSON(Country, '{"code": "ESP"}')).not.throw()

      const esp = M.fromJSON(Country, '{"code": "ESP"}')

      should(esp.code).be.exactly(undefined)

      esp.get('code').should.be.exactly('ESP')
    })

    it('allows simple model creation without inner types (discouraged)', () => {
      class Book extends M.createModel() {
        constructor(props) {
          super(Book, props)
        }
      }

      const myBook = new Book()

      JSON.stringify(myBook).should.be.exactly('{}')

      JSON.stringify(
        myBook.set('title', 'La verdad sobre el caso Savolta')
      ).should.be.exactly('{"title":"La verdad sobre el caso Savolta"}')
    })
  })

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      should(() => M.fromJSON(Person, author2Json)).throw()

      should(() => new Person(null)).throw()
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
        sex: M.Just.of(Sex.MALE())
      })

      // sanity check
      JSON.stringify(author1).should.be.exactly(author1Json)

      author1.givenName().should.be.exactly('Javier')

      // field setting
      const author2 = author1.set('givenName', 'Javi')

      // repeat sanity check
      author1.givenName().should.be.exactly('Javier')

      JSON.stringify(author1).should.be.exactly(author1Json)

      // new object checks
      should(author2 === author1).be.exactly(false)
      author2.givenName().should.be.exactly('Javi')
      author2.equals(author1).should.be.exactly(false, 'Oops, they are equal')
    })

    it('should support creating a copy with updated fields', () => {
      const _Book = M.createModel(m => ({
        title: m.string(),
        year: m.maybe(m.number()),
        author: m.withDefault(m.string(), 'anonymouss')
      }))

      class Book extends _Book {
        constructor(fields) {
          super(Book, fields)
        }
      }

      const book1 = new Book({
        title: 'El Guitarrista',
        year: M.Just.of(2002),
        author: 'Luis Landero'
      })

      const book2 = book1.copy({
        title: 'O Homem Duplicado',
        author: 'Jose Saramago'
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
        sex: M.Just.of(Sex.MALE())
      })

      const author2 = author1
        .setIn(['givenName'], 'Javi')
        .setIn(['birthday'], new Date('1989-04-16T00:00:00.000Z'))

      should(
        author2
          .birthday()
          .inner()
          .getFullYear()
      ).be.exactly(1989)
      should(
        author1
          .birthday()
          .inner()
          .getFullYear()
      ).be.exactly(1988)
    })

    it('edge case when Modelico setIn is called with an empty path', () => {
      const authorJson =
        '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'

      const author = JSON.parse(authorJson, _(Person).reviver)
      const listOfPeople1 = M.List.of(author)
      const listOfPeople2 = listOfPeople1.setIn([0, 'givenName'], 'Javi')
      const listOfPeople3 = listOfPeople2.setIn([0], M.fields(author))

      listOfPeople1
        .get(0)
        .givenName()
        .should.be.exactly('Javier')
      listOfPeople2
        .get(0)
        .givenName()
        .should.be.exactly('Javi')
      listOfPeople3
        .get(0)
        .givenName()
        .should.be.exactly('Javier')
    })

    it('should not support null (wrap with Maybe)', () => {
      should(
        () =>
          new Person({
            givenName: 'Javier',
            familyName: 'Cejudo',
            birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
            favouritePartOfDay: null,
            lifeEvents: M.Map.EMPTY(),
            importantDatesList: M.List.EMPTY(),
            importantDatesSet: M.Set.EMPTY(),
            sex: M.Just.of(Sex.MALE())
          })
      ).throw()
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
        sex: M.Just.of(Sex.MALE())
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
        sex: M.Just.of(Sex.MALE())
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
      })
        .equals(author1)
        .should.be.exactly(true)
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
        sex: M.Just.of(Sex.MALE())
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

      should('Javier Cejudo')
        .be.exactly(author1.fullName())
        .and.exactly(author2.fullName())

      should(1988)
        .be.exactly(
          author1
            .birthday()
            .inner()
            .getFullYear()
        )
        .and.exactly(
          author2
            .birthday()
            .inner()
            .getFullYear()
        )

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author1.favouritePartOfDay().minTime)
        .and.exactly(author2.favouritePartOfDay().minTime)

      should(Sex.MALE().toJSON())
        .be.exactly(author1.sex().toJSON())
        .and.exactly(author2.sex().toJSON())
    })

    it('should work with plain classes extending Modelico', () => {
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
        sex: M.Just.of(Sex.MALE()),
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
        sex: M.Just.of(Sex.MALE())
      })

      const author3 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo Goni',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Just.of(Sex.MALE())
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
      const authorJson =
        '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'

      const author = JSON.parse(authorJson, _(Person).reviver)

      JSON.stringify(author).should.be.exactly(
        '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}'
      )
    })
  })

  describe('M.new', () => {
    it('helps create Modelico instances in composition with map and others', () => {
      const results = [M.Number.of(10), M.Number.of(20), M.Number.of(Infinity)]

      should(
        [10, 20, Infinity].map(M.new(M.Number)).reduce((eq, x, i) => {
          return eq && results[i].equals(x)
        }, true)
      ).be.exactly(true)
    })
  })

  describe('circular innerTypes', () => {
    it('a Modelico type can have a key that is a Maybe of its own type', () => {
      const bestFriend = new Friend({
        name: 'John',
        bestFriend: M.Nothing
      })

      const marc = new Friend({
        name: 'Marc',
        bestFriend: M.Just.of(bestFriend)
      })

      marc
        .bestFriend()
        .getOrElse(Friend.EMPTY)
        .name()
        .should.be.exactly('John')
    })
  })

  describe('createSimpleModel', () => {
    it('should create a model without boilerplate', () => {
      const Book = M.createSimpleModel('Book', m => ({title: m.string()}))

      const myBook = new Book({title: 'Some title'})

      myBook.title().should.be.exactly('Some title')
      myBook.stringify().should.be.exactly('{"title":"Some title"}')

      M.fromJSON(Book, '{"title":"Some title"}')
        .equals(myBook)
        .should.be.exactly(true)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should use the metadata to coerce the value if necessary', () => {
      class CountryCallingCode extends M.createModel(() => ({
        code: withDefault(number(), '34')
      })) {
        constructor(props) {
          super(CountryCallingCode, props)
        }

        static innerTypes() {
          return super.innerTypes()
        }
      }

      const spain = M.fromJS(CountryCallingCode, {})

      Object.prototype.toString
        .call(spain)
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
        sex: M.Just.of(Sex.MALE())
      })

      Object.prototype.toString
        .call(author1)
        .should.be.exactly('[object ModelicoModel]')
    })
  })
}
