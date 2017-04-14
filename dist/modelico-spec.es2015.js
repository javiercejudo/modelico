/* eslint-env mocha */

var Base = (U, should, M, fixtures) => () => {
  const {
    Person,
    PartOfDay,
    Sex,
    Animal,
    Friend
  } = fixtures;

  const { _, number, string, withDefault } = M.metadata();
  const ModelicoDate = M.Date;

  const author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
  const author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

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
      };

      const author = new Person(authorFields);

      should(() => { authorFields.givenName = 'Javi'; })
        .throw();

      author.givenName()
        .should.be.exactly('Javier');
    });
  });

  describe('default innerTypes', () => {
    class Country extends M.Base {
      constructor (props) {
        super(Country, props);
      }
    }

    it('should not throw when static innerTypes are missing', () => {
      (() => M.fromJSON(Country, '{"code": "ESP"}'))
        .should.not.throw();

      const esp = M.fromJSON(Country, '{"code": "ESP"}');

      should(esp.code)
        .be.exactly(undefined);

      esp.get('code')
        .should.be.exactly('ESP');
    });

    it('allows simple model creation without inner types (discouraged)', () => {
      class Book extends M.createModel() {
        constructor (props) {
          super(Book, props);
        }
      }

      const myBook = new Book();

      JSON.stringify(myBook)
        .should.be.exactly('{}');

      JSON.stringify(myBook.set('title', 'La verdad sobre el caso Savolta'))
        .should.be.exactly('{"title":"La verdad sobre el caso Savolta"}');
    });
  });

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      should(() => M.fromJSON(Person, author2Json))
        .throw();

      should(() => new Person(null))
        .throw();
    });

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
      });

      // sanity check
      JSON.stringify(author1)
        .should.be.exactly(author1Json);

      author1.givenName().should.be.exactly('Javier');

      // field setting
      const author2 = author1.set('givenName', 'Javi');

      // repeat sanity check
      author1.givenName().should.be.exactly('Javier');

      JSON.stringify(author1)
        .should.be.exactly(author1Json);

      // new object checks
      should(author2 === author1).be.exactly(false);
      author2.givenName().should.be.exactly('Javi');
      author2.equals(author1).should.be.exactly(false, 'Oops, they are equal');
    });

    it('should support creating a copy with updated fields', () => {
      class Book extends M.createModel(m => ({
        title: m.string(),
        year: m.maybe(m.number()),
        author: m.withDefault(m.string(), 'anonymouss')
      })) {
        constructor (fields) {
          super(Book, fields);
        }
      }

      const book1 = new Book({
        title: 'El Guitarrista',
        year: M.Just.of(2002),
        author: 'Luis Landero'
      });

      const book2 = book1.copy({
        title: 'O Homem Duplicado',
        author: 'José Saramago'
      });

      book1.title().should.be.exactly('El Guitarrista');
      book2.title().should.be.exactly('O Homem Duplicado');

      should(book1.year().getOrElse(2017)).be.exactly(2002);
      should(book2.year().getOrElse(2017)).be.exactly(2002);
    });

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
      });

      const author2 = author1.setIn(['givenName'], 'Javi')
        .setIn(['birthday'], new Date('1989-04-16T00:00:00.000Z'));

      should(author2.birthday().inner().getFullYear())
        .be.exactly(1989);

      // verify that the original author1 was not mutated
      should(author1.birthday().inner().getFullYear())
        .be.exactly(1988);
    });

    it('edge case when Modélico setIn is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);
      const listOfPeople1 = M.List.of(author);

      const listOfPeople2 = listOfPeople1.setIn([0, 'givenName'], 'Javi');
      const listOfPeople3 = listOfPeople2.setIn([0], M.fields(author));

      listOfPeople1.get(0).givenName().should.be.exactly('Javier');
      listOfPeople2.get(0).givenName().should.be.exactly('Javi');
      listOfPeople3.get(0).givenName().should.be.exactly('Javier');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: null,
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Just.of(Sex.MALE())
      })).should.throw();
    });
  });

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
      });

      author1.toJS().should.eql({
        birthday: '1988-04-16T00:00:00.000Z',
        familyName: 'Cejudo',
        favouritePartOfDay: 'EVENING',
        givenName: 'Javier',
        importantDatesList: [],
        importantDatesSet: [],
        lifeEvents: [],
        sex: 'MALE'
      });
    });
  });

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
      });

      M.fromJS(Person, {
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: '1988-04-16T00:00:00.000Z',
        favouritePartOfDay: 'EVENING',
        lifeEvents: [],
        importantDatesList: [],
        importantDatesSet: [],
        sex: 'MALE'
      }).equals(author1).should.be.exactly(true);
    });
  });

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
      });

      JSON.stringify(author1)
        .should.be.exactly(author1Json)
        .and.exactly(author1.stringify());
    });
  });

  describe('parsing', () => {
    it('should parse types correctly', () => {
      const author1 = M.fromJSON(Person, author1Json);
      const author2 = JSON.parse(author1Json, _(Person).reviver);

      'Javier Cejudo'
        .should.be.exactly(author1.fullName())
        .and.exactly(author2.fullName());

      should(1988)
        .be.exactly(author1.birthday().inner().getFullYear())
        .and.exactly(author2.birthday().inner().getFullYear());

      should(PartOfDay.EVENING().minTime)
        .be.exactly(author1.favouritePartOfDay().minTime)
        .and.exactly(author2.favouritePartOfDay().minTime);

      should(Sex.MALE().toJSON())
        .be.exactly(author1.sex().toJSON())
        .and.exactly(author2.sex().toJSON());
    });

    it('should work with plain classes extending Modélico', () => {
      const animal = JSON.parse('{"name": "Sam"}', _(Animal).reviver);

      animal.speak().should.be.exactly('hello');
      animal.name().should.be.exactly('Sam');
    });
  });

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
      });

      const author2 = new Person({
        familyName: 'Cejudo',
        givenName: 'Javier',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Just.of(Sex.MALE())
      });

      const author3 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo Goñi',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        sex: M.Just.of(Sex.MALE())
      });

      const author4 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY()
      });

      const author5 = new Person({
        givenName: 'Javier',
        familyName: 'Cejudo',
        birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        favouritePartOfDay: PartOfDay.EVENING(),
        lifeEvents: M.Map.EMPTY(),
        importantDatesList: M.List.EMPTY(),
        importantDatesSet: M.Set.EMPTY(),
        extra: 1
      });

      author1.equals(author1).should.be.exactly(true);
      author1.equals(author2).should.be.exactly(true);
      author1.equals(author3).should.be.exactly(false);
      author1.equals(author4).should.be.exactly(false);
      author1.equals(author5).should.be.exactly(false);
      author1.equals(2).should.be.exactly(false);

      author1.should.not.be.exactly(author2);
    });
  });

  describe('fields', () => {
    it('preserves undeclared properties', () => {
      const authorJson = '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);

      JSON.stringify(author).should.be.exactly('{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}');
    });
  });

  describe('circular innerTypes', () => {
    it('a Modélico type can have a key that is a Maybe of its own type', () => {
      const bestFriend = new Friend({
        name: 'John',
        bestFriend: M.Nothing
      });

      const marc = new Friend({
        name: 'Marc',
        bestFriend: M.Just.of(bestFriend)
      });

      marc
        .bestFriend().getOrElse(Friend.EMPTY)
        .name()
        .should.be.exactly('John');
    });
  });

  describe('withDefault', () => {
    it('should allow enhancing metadata to have default values', () => {
      class Book extends M.createModel({
        title: string(),
        author: withDefault(string(), 'anonymous')
      }, {stringTag: 'Book'}) {
        constructor (props) {
          super(Book, props);
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
      });

      lazarillo1.getTitleBy()
        .should.be.exactly('"Lazarillo de Tormes" by anonymous');

      const lazarillo2 = new Book({
        title: 'Lazarillo de Tormes'
      });

      lazarillo2.getTitleBy()
        .should.be.exactly('"Lazarillo de Tormes" by anonymous');
    });
  });

  describe('withDefault', () => {
    it('should use the metadata to coerce the value if necessary', () => {
      class CountryCallingCode extends M.createModel(() => ({
        code: withDefault(number(), '34')
      })) {
        constructor (props) {
          super(CountryCallingCode, props);
        }

        static innerTypes () {
          return super.innerTypes()
        }
      }

      const spain = M.fromJS(CountryCallingCode, {});

      spain.code()
        .should.be.exactly(34);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should use the metadata to coerce the value if necessary', () => {
      class CountryCallingCode extends M.createModel(() => ({
        code: withDefault(number(), '34')
      })) {
        constructor (props) {
          super(CountryCallingCode, props);
        }

        static innerTypes () {
          return super.innerTypes()
        }
      }

      const spain = M.fromJS(CountryCallingCode, {});

      Object.prototype.toString.call(spain)
        .should.be.exactly('[object ModelicoModel]');
    });

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
      });

      Object.prototype.toString.call(author1)
        .should.be.exactly('[object ModelicoModel]');
    });
  });
};

/* eslint-env mocha */

var ModelicoNumber = (U, should, M) => () => {
  const { number } = M.metadata();

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      (() => M.Number(5)).should.throw();
    });

    it('should cast using Number', () => {
      should(new M.Number().inner()).be.exactly(0);
      should(new M.Number(2).inner()).be.exactly(2);
      should(new M.Number('2').inner()).be.exactly(2);
      should(new M.Number('-Infinity').inner()).be.exactly(-Infinity);
    });
  });

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      (() => M.Number.of(null))
        .should.throw();
    });

    it('should set numbers correctly', () => {
      const numberA = M.Number.of(2);
      const numberB = numberA.setIn([], 5);

      should(numberA.inner())
        .be.exactly(2);

      should(numberB.inner())
        .be.exactly(5);
    });

    it('should not support the set operation', () => {
      const myNumber = M.Number.of(55);

      (() => myNumber.set())
        .should.throw();
    });

    it('should not support the setIn operation with non-empty paths', () => {
      const myNumber = M.Number.of(5);

      (() => myNumber.setIn([0], 7))
        .should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const myNumber = M.Number.of(21);

      JSON.stringify(myNumber).should.be.exactly('21');
    });

    it('should support -0', () => {
      const myNumber = M.Number.of(-0);

      JSON.stringify(myNumber).should.be.exactly('"-0"');
    });

    it('should support Infinity', () => {
      const myNumber = M.Number.of(Infinity);

      JSON.stringify(myNumber).should.be.exactly('"Infinity"');
    });

    it('should support -Infinity', () => {
      const myNumber = M.Number.of(-Infinity);

      JSON.stringify(myNumber).should.be.exactly('"-Infinity"');
    });

    it('should support NaN', () => {
      const myNumber = M.Number.of(NaN);

      JSON.stringify(myNumber).should.be.exactly('"NaN"');
    });
  });

  describe('parsing', () => {
    it('should parse values correctly', () => {
      const myNumber = JSON.parse('2', number({ wrap: true }).reviver);

      should(myNumber.inner()).be.exactly(2);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        number({ wrap: true }).reviver
      )).should.throw();
    });

    it('should support -0', () => {
      const myNumber = JSON.parse('"-0"', number({ wrap: true }).reviver);

      Object.is(myNumber.inner(), -0).should.be.exactly(true);
    });

    it('should support Infinity', () => {
      const myNumber = JSON.parse('"Infinity"', number({ wrap: true }).reviver);

      Object.is(myNumber.inner(), Infinity).should.be.exactly(true);
    });

    it('should support -Infinity', () => {
      const myNumber = JSON.parse('"-Infinity"', number({ wrap: true }).reviver);

      Object.is(myNumber.inner(), -Infinity).should.be.exactly(true);
    });

    it('should support NaN', () => {
      const myNumber = JSON.parse('"NaN"', number({ wrap: true }).reviver);

      Object.is(myNumber.inner(), NaN).should.be.exactly(true);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoNumber1 = M.Number.of(2);
      const modelicoNumber2 = M.Number.of(2);

      modelicoNumber1.should.not.be.exactly(modelicoNumber2);
      modelicoNumber1.should.not.equal(modelicoNumber2);

      modelicoNumber1.equals(modelicoNumber1).should.be.exactly(true);
      modelicoNumber1.equals(modelicoNumber2).should.be.exactly(true);
      modelicoNumber1.equals(2).should.be.exactly(false);
    });

    it('should have same-value-zero semantics', () => {
      M.Number.of(0).equals(M.Number.of(-0)).should.be.exactly(true);
      M.Number.of(NaN).equals(M.Number.of(NaN)).should.be.exactly(true);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Number.of(1))
        .should.be.exactly('[object ModelicoNumber]');
    });
  });
};

/* eslint-env mocha */

var ModelicoDate = (U, should, M) => () => {
  const { date } = M.metadata();

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Date('1988-04-16T00:00:00.000Z');
      const myDate = M.Date.of(input);

      input.setFullYear(2017);

      should(myDate.inner().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('instantiation', () => {
    it('uses the current date by default', () => {
      const mDate = new M.Date();
      const nativeDate = new Date();

      should(mDate.inner().getFullYear())
        .be.exactly(nativeDate.getFullYear());

      should(mDate.inner().getMonth())
        .be.exactly(nativeDate.getMonth());

      should(mDate.inner().getDate())
        .be.exactly(nativeDate.getDate());
    });

    it('must be instantiated with new', () => {
      (() => M.Date()).should.throw();
    });
  });

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      (() => M.Date.of(null))
        .should.throw();
    });

    it('should set dates correctly', () => {
      const date1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));
      const date2 = date1.setIn([], new Date('1989-04-16T00:00:00.000Z'));

      should(date2.inner().getFullYear())
        .be.exactly(1989);

      should(date1.inner().getFullYear())
        .be.exactly(1988);
    });

    it('should not support the set operation', () => {
      const myDate = M.Date.of(new Date());

      (() => myDate.set())
        .should.throw();
    });

    it('should not support the setIn operation with non-empty paths', () => {
      const myDate = M.Date.of(new Date());

      (() => myDate.setIn([0], new Date()))
        .should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const myDate = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));

      JSON.stringify(myDate).should.be.exactly('"1988-04-16T00:00:00.000Z"');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const myDate = JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver);

      should(myDate.inner().getFullYear()).be.exactly(1988);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        date().reviver
      )).should.throw();
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoDate1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));
      const modelicoDate2 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));

      modelicoDate1.should.not.be.exactly(modelicoDate2);
      modelicoDate1.should.not.equal(modelicoDate2);

      modelicoDate1.equals(modelicoDate1).should.be.exactly(true);
      modelicoDate1.equals(modelicoDate2).should.be.exactly(true);
      modelicoDate1.equals('abc').should.be.exactly(false);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Date.of())
        .should.be.exactly('[object ModelicoDate]');
    });
  });
};

/* eslint-env mocha */

var ModelicoMap = (U, should, M, { Person }) => () => {
  const { date, map, number, string } = M.metadata();

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        ['A', 'Good morning!'],
        ['B', 'Good afternoon!'],
        ['C', 'Good evening!']
      ]);

      const map = M.Map.fromMap(input);

      input.set('A', "g'day!");

      map.get('A')
        .should.be.exactly('Good morning!');
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const map = M.Map.fromObject({a: 1, b: 2, c: 3});

      [...map]
        .should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Map(null))
        .should.throw();
    });

    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date())]
      ]);

      const modelicoMap1 = M.Map.fromMap(map);
      const modelicoMap2 = modelicoMap1.set('a', M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoMap2.inner().get('a').inner().getFullYear())
        .be.exactly(1989);

      // verify that modelicoMap1 was not mutated
      should(modelicoMap1.inner().get('a').inner().getFullYear())
        .be.exactly(1988);
    });

    it('should set fields returning a new map when part of a path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author1 = M.fromJSON(Person, authorJson);
      const author2 = author1.setIn(['lifeEvents', 'wedding'], new Date('2010-03-28T00:00:00.000Z'));

      should(author2.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2010);

      // verify that author1 was not mutated
      should(author1.lifeEvents().inner().get('wedding').inner().getFullYear())
        .be.exactly(2013);
    });

    it('edge case when setIn is called with an empty path', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author = M.fromJSON(Person, authorJson);

      const map = author.lifeEvents();

      should(map.inner().get('wedding').inner().getFullYear())
        .be.exactly(2013);

      const customMap = new Map([
        ['wedding', M.Date.of(new Date('2010-03-28T00:00:00.000Z'))]
      ]);

      const map2 = map.setIn([], customMap);

      should(map2.inner().get('wedding').inner().getFullYear())
        .be.exactly(2010);
    });
  });

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]
      ]);

      const modelicoMap = M.Map.fromMap(map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]');
    });
  });

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]',
        map(string(), date()).reviver
      );

      const modelicoMapAlt = JSON.parse(
        '[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]',
        map(() => string(), () => date()).reviver
      );

      modelicoMap.equals(modelicoMapAlt)
        .should.be.exactly(true);

      should(modelicoMap.inner().get('a').inner().getFullYear())
        .be.exactly(1988);

      should(modelicoMap.inner().get('b').inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author = M.fromJSON(Person, authorJson);

      should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
    });

    it('should be able to work with M.genericsFromJSON', () => {
      const myMap = M.genericsFromJSON(M.Map, [number(), string()], '[[1, "10"], [2, "20"], [3, "30"]]');

      myMap.inner().get(2)
        .should.be.exactly('20');
    });

    it('should be able to work with M.genericsFromJS', () => {
      const myMap = M.genericsFromJS(M.Map, [number(), string()], [[1, '10'], [2, '20'], [3, '30']]);

      myMap.inner().get(2)
        .should.be.exactly('20');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        map(string(), date()).reviver
      )).should.throw();
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = M.Map.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      const modelicoMap2 = M.Map.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap).should.be.exactly(true);
      modelicoMap.equals(modelicoMap2).should.be.exactly(true);

      modelicoMap.equals(2).should.be.exactly(false);
      M.Map.EMPTY().equals(modelicoMap).should.be.exactly(false);
    });

    it('should have same-value-zero semantics', () => {
      M.Map.of('a', 0).equals(M.Map.of('a', -0)).should.be.exactly(true);
      M.Map.of('a', NaN).equals(M.Map.of('a', NaN)).should.be.exactly(true);

      M.Map.of(-0, 33).equals(M.Map.of(0, 33)).should.be.exactly(true);
    });

    it('should support simple unordered checks', () => {
      M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1))
        .should.be.exactly(false);

      M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1), true)
        .should.be.exactly(true);

      M.Map.of('a', 1, 'b', 2, 'c', undefined).equals(M.Map.of('b', 2, 'a', 1, 'd', 4), true)
        .should.be.exactly(false);
    });
  });

  describe('EMPTY / of / fromArray / fromObject / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.Map.EMPTY().inner().size)
        .be.exactly(0);

      M.Map.EMPTY().toJSON()
        .should.eql([]);

      new M.Map()
        .should.be.exactly(M.Map.EMPTY());
    });

    it('should be able to create a map from an even number of params', () => {
      var map = M.Map.of('a', 1, 'b', 2, 'c', 3);

      should(map.inner().get('b')).be.exactly(2);

      (() => M.Map.of('a', 1, 'b', 2, 'c', 3, 'd'))
        .should.throw();
    });

    it('should be able to create a map from an array', () => {
      var map = M.Map.fromArray([['a', 1], ['b', 2], ['c', 3]]);

      should(map.inner().get('b')).be.exactly(2);
    });

    it('should be able to create a map from an object', () => {
      var map = M.Map.fromObject({a: 1, b: 2, c: 3});

      should(map.inner().get('b')).be.exactly(2);
    });

    it('should be able to create a map from a native map', () => {
      var map = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

      should(map.inner().get('b')).be.exactly(2);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Map.of())
        .should.be.exactly('[object ModelicoMap]');
    });
  });
};

/* eslint-env mocha */

var ModelicoStringMap = (should, M, { Person }) => () => {
  const { date, number, stringMap } = M.metadata();

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        ['A', 'Good morning!'],
        ['B', 'Good afternoon!'],
        ['C', 'Good evening!']
      ]);

      const map = M.StringMap.fromMap(input);

      input.set('A', "g'day!");

      map.inner().get('A')
        .should.be.exactly('Good morning!');
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const map = M.StringMap.fromObject({a: 1, b: 2, c: 3});

      map.toJSON()
        .should.eql({a: 1, b: 2, c: 3});
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.StringMap(null))
        .should.throw();
    });

    it('should set fields returning a new map', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date())]
      ]);

      const modelicoMap1 = M.StringMap.fromMap(map);
      const modelicoMap2 = modelicoMap1.set('a', M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoMap2.inner().get('a').inner().getFullYear())
        .be.exactly(1989);

      // verify that modelicoMap1 was not mutated
      should(modelicoMap1.inner().get('a').inner().getFullYear())
        .be.exactly(1988);
    });
  });

  describe('stringifying', () => {
    it('should stringify the map correctly', () => {
      const map = new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]
      ]);

      const modelicoMap = M.StringMap.fromMap(map);

      JSON.stringify(modelicoMap)
        .should.be.exactly('{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}');
    });
  });

  describe('parsing', () => {
    it('should parse the map correctly', () => {
      const modelicoMap = JSON.parse(
        '{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}',
        stringMap(date()).reviver
      );

      const modelicoMapAlt = JSON.parse(
        '{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}',
        stringMap(() => date()).reviver
      );

      modelicoMap.equals(modelicoMapAlt)
        .should.be.exactly(true);

      should(modelicoMap.inner().get('a').inner().getFullYear())
        .be.exactly(1988);

      should(modelicoMap.inner().get('b').inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
      const author = M.fromJSON(Person, authorJson);

      should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
    });

    it('should be able to work with M.genericsFromJSON', () => {
      const myMap = M.genericsFromJSON(M.StringMap, [number()], '{"1":10,"2":20,"3":30}');

      should(myMap.inner().get('2'))
        .be.exactly(20);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        stringMap(date()).reviver
      )).should.throw();
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMap = M.StringMap.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      const modelicoMap2 = M.StringMap.fromMap(new Map([
        ['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]
      ]));

      modelicoMap.should.not.be.exactly(modelicoMap2);
      modelicoMap.should.not.equal(modelicoMap2);

      modelicoMap.equals(modelicoMap).should.be.exactly(true);
      modelicoMap.equals(modelicoMap2).should.be.exactly(true);

      modelicoMap.equals(2).should.be.exactly(false);
      M.StringMap.EMPTY().equals(modelicoMap).should.be.exactly(false);
    });

    it('should have same-value-zero semantics', () => {
      M.StringMap.of('a', 0).equals(M.StringMap.of('a', -0)).should.be.exactly(true);
      M.StringMap.of('a', NaN).equals(M.StringMap.of('a', NaN)).should.be.exactly(true);
    });
  });

  describe('EMPTY / of / fromArray / fromObject / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.StringMap.EMPTY().inner().size)
        .be.exactly(0);

      M.StringMap.EMPTY().toJSON()
        .should.eql({});
    });

    it('should be able to create a map from an even number of params', () => {
      var map = M.StringMap.of('a', 1, 'b', 2, 'c', 3);

      should(map.inner().get('b')).be.exactly(2);

      (() => M.StringMap.of('a', 1, 'b', 2, 'c', 3, 'd'))
        .should.throw();
    });

    it('should be able to create a map from an array', () => {
      var map = M.StringMap.fromArray([['a', 1], ['b', 2], ['c', 3]]);

      should(map.inner().get('b')).be.exactly(2);
    });

    it('should be able to create a map from an object', () => {
      var map = M.StringMap.fromObject({a: 1, b: 2, c: 3});

      should(map.inner().get('b')).be.exactly(2);
    });

    it('should be able to create a map from a native map', () => {
      var map = M.StringMap.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

      should(map.inner().get('b')).be.exactly(2);
    });
  });
};

/* eslint-env mocha */

var ModelicoEnum = (should, M, { PartOfDay }) => () => {
  describe('keys', () => {
    it('only enumerates the enumerators', () => {
      Object.keys(PartOfDay)
        .should.eql(['ANY', 'MORNING', 'AFTERNOON', 'EVENING']);
    });
  });

  describe('equals', () => {
    it('should identify equal instances', () => {
      should(PartOfDay.MORNING() === PartOfDay.MORNING())
        .be.exactly(true);

      PartOfDay.MORNING().equals(PartOfDay.MORNING())
        .should.be.exactly(true);

      PartOfDay.MORNING().equals(PartOfDay.EVENING())
        .should.be.exactly(false);
    });
  });
};

/* eslint-env mocha */

var ModelicoEnumMap = (U, should, M, { PartOfDay }) => () => {
  const { _, any, anyOf, enumMap, string } = M.metadata();

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ]);

      const enumMap = M.EnumMap.fromMap(input);

      input.set(PartOfDay.MORNING(), "g'day!");

      enumMap.inner().get(PartOfDay.MORNING())
        .should.be.exactly('Good morning!');
    });
  });

  describe('setting', () => {
    it('should set fields returning a new enum map', () => {
      const greetings1 = M.EnumMap.of(
        PartOfDay.MORNING(), 'Good morning!',
        PartOfDay.AFTERNOON(), 'Good afternoon!',
        PartOfDay.EVENING(), 'Good evening!'
      );

      const greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

      greetings2.inner().get(PartOfDay.AFTERNOON())
        .should.be.exactly('GOOD AFTERNOON!');

      greetings1.inner().get(PartOfDay.AFTERNOON())
        .should.be.exactly('Good afternoon!');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.EnumMap(null))
        .should.throw();
    });

    it('should set fields returning a new enum map when part of a path', () => {
      const map = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), M.Date.of(new Date('2000-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]
      ]);

      const greetings1 = M.EnumMap.fromMap(map);
      const greetings2 = greetings1.setIn([PartOfDay.EVENING()], new Date('2013-04-16T00:00:00.000Z'));

      should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2013);

      should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2012);
    });

    it('edge case when setIn is called with an empty path', () => {
      const map1 = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), M.Date.of(new Date('2000-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]
      ]);

      const map2 = new Map([
        [PartOfDay.MORNING(), M.Date.of(new Date('1989-04-16T00:00:00.000Z'))],
        [PartOfDay.AFTERNOON(), M.Date.of(new Date('2001-04-16T00:00:00.000Z'))],
        [PartOfDay.EVENING(), M.Date.of(new Date('2013-04-16T00:00:00.000Z'))]
      ]);

      const greetings1 = M.EnumMap.fromMap(map1);
      const greetings2 = greetings1.setIn([], map2);

      should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2013);

      should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear())
        .be.exactly(2012);
    });
  });

  describe('stringifying', () => {
    it('should stringify the enum map correctly', () => {
      const map = new Map([
        [PartOfDay.MORNING(), 'Good morning!'],
        [PartOfDay.AFTERNOON(), 'Good afternoon!'],
        [PartOfDay.EVENING(), 'Good evening!']
      ]);

      const greetings = M.EnumMap.fromMap(map);

      JSON.stringify(greetings)
        .should.be.exactly('{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}');
    });
  });

  describe('parsing', () => {
    it('should parse the enum map correctly', () => {
      const greetings = JSON.parse(
        '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}',
        enumMap(_(PartOfDay), any()).reviver
      );

      const greetingsAlt = JSON.parse(
        '{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}',
        enumMap(() => _(PartOfDay), anyOf()).reviver
      );

      greetings.equals(greetingsAlt)
        .should.be.exactly(true);

      greetings.inner().get(PartOfDay.MORNING())
        .should.be.exactly('Good morning!');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        enumMap(_(PartOfDay), string()).reviver
      )).should.throw();
    });
  });

  describe('EMPTY / of / fromArray / fromMap', () => {
    it('should have a static property for the empty map', () => {
      should(M.EnumMap.EMPTY().inner().size)
        .be.exactly(0);

      M.EnumMap.EMPTY().toJSON()
        .should.eql({});

      new M.EnumMap()
        .should.be.exactly(M.EnumMap.EMPTY());
    });

    it('should be able to create an enum map from an even number of params', () => {
      var map = M.EnumMap.of(
        PartOfDay.MORNING(), 1,
        PartOfDay.AFTERNOON(), 2,
        PartOfDay.EVENING(), 3
      );

      should(map.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);

      (() => M.EnumMap.of(PartOfDay.MORNING(), 1, PartOfDay.AFTERNOON()))
        .should.throw();
    });

    it('should be able to create an enum map from an array', () => {
      var enumMap = M.EnumMap.fromArray([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]]);

      should(enumMap.inner().get(PartOfDay.MORNING())).be.exactly(1);
    });

    it('should be able to create an enum map from a native map', () => {
      var enumMap = M.EnumMap.fromMap(new Map([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]]));

      should(enumMap.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.EnumMap.of())
        .should.be.exactly('[object ModelicoEnumMap]');
    });
  });
};

/* eslint-env mocha */

var ModelicoList = (U, should, M, { Person }) => () => {
  const { _, list, date, string, number, maybe } = M.metadata();

  describe('immutability', () => {
    it('must freeze the input', () => {
      const input = ['a', 'b', 'c'];

      M.List.fromArray(input);

      should(() => { input[1] = 'B'; })
        .throw();
    });
  });

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      (() => M.List()).should.throw();
    });
  });

  describe('get', () => {
    it('should return the nth item', () => {
      M.List.of('a', 'b', 'c').get(1)
        .should.be.exactly('b');
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const list = M.List.fromArray([1, 2, 3, 4]);

      Array.from(list)
        .should.eql([1, 2, 3, 4]);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.List(null))
        .should.throw();
    });

    it('should set items in the list correctly', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ];

      const modelicoList1 = M.List.fromArray(list);
      const modelicoList2 = modelicoList1.set(0, M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the list correctly when part of a path', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ];

      const modelicoList1 = M.List.fromArray(list);
      const modelicoList2 = modelicoList1.setIn([0], new Date('1989-04-16T00:00:00.000Z'));

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(1989);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988);
    });

    it('should set items in the list correctly when part of a path with a single element', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      ];

      const modelicoList1 = M.List.fromArray(list);
      const modelicoList2 = modelicoList1.setIn([0], new Date('2000-04-16T00:00:00.000Z'));

      should(modelicoList2.get(0).inner().getFullYear())
        .be.exactly(2000);

      // verify that modelicoList1 was not mutated
      should(modelicoList1.get(0).inner().getFullYear())
        .be.exactly(1988);
    });

    it('should be able to set a whole list', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author1 = JSON.parse(authorJson, _(Person).reviver);

      const newListArray = [...author1.importantDatesList()];
      newListArray.splice(1, 0, M.Date.of(new Date('2016-05-03T00:00:00.000Z')));

      const author2 = author1.set(
        'importantDatesList',
        M.List.fromArray(newListArray)
      );

      should(author1.importantDatesList().size).be.exactly(2);
      should(author1.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
      should(author1.importantDatesList().get(1).inner().getFullYear()).be.exactly(2012);

      should([...author2.importantDatesList()].length).be.exactly(3);
      should(author2.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
      should(author2.importantDatesList().get(1).inner().getFullYear()).be.exactly(2016);
      should(author2.importantDatesList().get(2).inner().getFullYear()).be.exactly(2012);
    });

    it('edge case when List setIn is called with an empty path', () => {
      const modelicoDatesList1 = M.List.of(
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      );

      const modelicoDatesList2 = [
        M.Date.of(new Date('2016-04-16T00:00:00.000Z'))
      ];

      const listOfListOfDates1 = M.List.of(modelicoDatesList1);
      const listOfListOfDates2 = listOfListOfDates1.setIn([0], modelicoDatesList2);

      should(listOfListOfDates1.get(0).get(0).inner().getFullYear())
        .be.exactly(1988);

      should(listOfListOfDates2.get(0).get(0).inner().getFullYear())
        .be.exactly(2016);
    });
  });

  describe('stringifying', () => {
    it('should stringify the list correctly', () => {
      const list = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date('2012-12-25T00:00:00.000Z'))
      ];

      const modelicoList = M.List.fromArray(list);

      JSON.stringify(modelicoList)
        .should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]');
    });
  });

  describe('parsing', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        list(date()).reviver
      );

      should(modelicoList.get(0).inner().getFullYear())
        .be.exactly(1988);

      should(modelicoList.get(1).inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);

      should(author.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
    });

    it('should not support null (wrap with Maybe)', () => {
      should(() => JSON.parse('null', list(date()).reviver))
        .throw('missing list');

      should(() => M.genericsFromJS(M.List, [date()], [null]))
        .throw(/missing date/);

      should(() => M.genericsFromJS(M.List, [string()], [null]))
        .throw(/expected a value but got nothing \(null, undefined or NaN\)/);

      should(() => M.genericsFromJS(M.List, [string()], [undefined]))
        .throw(/expected a value but got nothing \(null, undefined or NaN\)/);

      should(() => M.genericsFromJS(M.List, [string()], [NaN]))
        .throw(/expected a value but got nothing \(null, undefined or NaN\)/);
    });
  });

  describe('tuples', () => {
    it('should support tuples', () => {
      M.genericsFromJS(M.List, [[string(), date()]], ['a', new Date('1988-04-16T00:00:00.000Z')])
        .equals(M.List.of('a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))))
        .should.be.exactly(true);
    });

    it('should require all values', () => {
      should(() => M.genericsFromJS(M.List, [[string(), number()]], ['a']))
        .throw(/tuple has missing or extra items/);

      should(() => M.genericsFromJS(M.List, [[string(), number()]], []))
        .throw(/tuple has missing or extra items/);
    });

    it('should not support null (wrap with Maybe)', () => {
      should(() => M.genericsFromJS(M.List, [[string(), number()]], [undefined, NaN]))
        .throw(/expected a value but got nothing \(null, undefined or NaN\)/);
    });

    it('should support missing maybes', () => {
      should(() => M.genericsFromJS(M.List, [[maybe(string()), maybe(number())]], [undefined, NaN]))
        .not.throw();
    });
  });

  describe('metadata-returning function', () => {
    it('should parse the list correctly', () => {
      const modelicoList = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        list(() => date()).reviver
      );

      should(modelicoList.get(0).inner().getFullYear())
        .be.exactly(1988);

      should(modelicoList.get(1).inner().getMonth())
        .be.exactly(11);
    });

    it('should support tuples', () => {
      M.genericsFromJS(M.List, [[() => string(), () => date()]], ['a', new Date('1988-04-16T00:00:00.000Z')])
        .equals(M.List.of('a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))))
        .should.be.exactly(true);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoList1 = M.List.of(1, 2, 3);
      const modelicoList2 = M.List.of(1, 2, 3);

      modelicoList1.should.not.be.exactly(modelicoList2);
      modelicoList1.should.not.equal(modelicoList2);

      modelicoList1.equals(modelicoList1).should.be.exactly(true);
      modelicoList1.equals(modelicoList2).should.be.exactly(true);

      modelicoList1.equals(() => 1).should.be.exactly(false);
      M.List.EMPTY().equals(modelicoList1).should.be.exactly(false);
    });

    it('should support non-primitive types', () => {
      const modelicoList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));
      const modelicoList2 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

      modelicoList1.should.not.be.exactly(modelicoList2);
      modelicoList1.should.not.equal(modelicoList2);

      modelicoList1.equals(modelicoList1).should.be.exactly(true);
      modelicoList1.equals(modelicoList2).should.be.exactly(true);

      M.List.of(2, 4).equals(M.Set.of(2, 4)).should.be.exactly(false);
      M.List.of(2, 4).equals(M.List.of(4, 2)).should.be.exactly(false);
    });

    it('should have same-value-zero semantics', () => {
      M.List.of(0).equals(M.List.of(-0)).should.be.exactly(true);
      M.List.of(NaN).equals(M.List.of(NaN)).should.be.exactly(true);
    });
  });

  describe('EMPTY / of / fromArray', () => {
    it('should have a static property for the empty list', () => {
      should([...M.List.EMPTY()].length)
        .be.exactly(0);

      M.List.EMPTY().toJSON()
        .should.eql([]);

      new M.List()
        .should.be.exactly(M.List.EMPTY());
    });

    it('should be able to create a list from arbitrary parameters', () => {
      const modelicoList = M.List.of(0, 1, 1, 2, 3, 5, 8);

      Array.from(modelicoList)
        .should.eql([0, 1, 1, 2, 3, 5, 8]);
    });

    it('should be able to create a list from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8];

      const modelicoList = M.List.fromArray(fibArray);

      Array.from(modelicoList)
        .should.eql([0, 1, 1, 2, 3, 5, 8]);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.List.of())
        .should.be.exactly('[object ModelicoList]');
    });
  });
};

/* eslint-env mocha */

var ModelicoSet = (U, should, M, { Person }) => () => {
  const { _, date, set } = M.metadata();

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Set(['a', 'b', 'c']);
      const set = M.Set.fromSet(input);

      input.delete('a');

      set.has('a')
        .should.be.exactly(true);
    });
  });

  describe('setting', () => {
    it('should implement Symbol.iterator', () => {
      const set = M.Set.fromArray([1, 2, 2, 4]);

      [...set]
        .should.eql([1, 2, 4]);
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse('null', set(date()).reviver))
        .should.throw();
    });

    it('should be able to set a whole set', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
      const author1 = JSON.parse(authorJson, _(Person).reviver);

      const date = M.Date.of(new Date('2016-05-03T00:00:00.000Z'));

      const author2 = author1.set(
        'importantDatesSet',
        M.Set.of(date)
      );

      const author1InnerSet = author1.importantDatesSet().inner();

      should(author1InnerSet.size).be.exactly(2);

      const author2InnerSet = author2.importantDatesSet().inner();

      should(author2InnerSet.size).be.exactly(1);
      author2InnerSet.has(date).should.be.exactly(true);
    });

    it('edge case when Set setIn is called with an empty path', () => {
      const modelicoDatesSet1 = M.Set.of(
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date())
      );

      const modelicoDatesSet2 = new Set([
        M.Date.of(new Date('2016-04-16T00:00:00.000Z'))
      ]);

      const listOfSetsOfDates1 = M.List.of(modelicoDatesSet1);
      const listOfSetsOfDates2 = listOfSetsOfDates1.setIn([0], modelicoDatesSet2);

      should([...[...listOfSetsOfDates1][0]][0].inner().getFullYear())
        .be.exactly(1988);

      should([...[...listOfSetsOfDates2][0]][0].inner().getFullYear())
        .be.exactly(2016);
    });

    it('should not support the set operation', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.set(0, 3))
        .should.throw();
    });

    it('should not support the setIn operation with non-empty paths', () => {
      const mySet = M.Set.of(1, 2);

      (() => mySet.setIn([0], 3))
        .should.throw();
    });
  });

  describe('stringifying', () => {
    it('should stringify the set correctly', () => {
      const set = [
        M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
        M.Date.of(new Date('2012-12-25T00:00:00.000Z'))
      ];

      const modelicoSet = M.Set.fromArray(set);

      JSON.stringify(modelicoSet)
        .should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]');
    });

    it('should not support null (wrap with Maybe)', () => {
      (() => new M.Set(null))
        .should.throw();
    });
  });

  describe('parsing', () => {
    it('should parse the set correctly', () => {
      const modelicoSet = JSON.parse(
        '["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]',
        set(date()).reviver
      );

      should([...modelicoSet][0].inner().getFullYear())
        .be.exactly(1988);

      should([...modelicoSet][1].inner().getMonth())
        .be.exactly(11);
    });

    it('should be parsed correctly when used within another class', () => {
      const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
      const author = JSON.parse(authorJson, _(Person).reviver);

      should([...author.importantDatesSet()][0].inner().getFullYear())
        .be.exactly(2013);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoSet1 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));
      const modelicoSet2 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

      modelicoSet1.should.not.be.exactly(modelicoSet2);
      modelicoSet1.should.not.equal(modelicoSet2);

      modelicoSet1.equals(modelicoSet1).should.be.exactly(true);
      modelicoSet1.equals(modelicoSet2).should.be.exactly(true);

      modelicoSet1.equals(/abc/).should.be.exactly(false);
      M.Set.EMPTY().equals(modelicoSet1).should.be.exactly(false);
    });

    it('should have same-value-zero semantics', () => {
      M.Set.of(0).equals(M.Set.of(-0)).should.be.exactly(true);
      M.Set.of(NaN).equals(M.Set.of(NaN)).should.be.exactly(true);
    });

    it('should support simple unordered checks', () => {
      M.Set.of(1, 2, 3).equals(M.Set.of(1, 3, 2))
        .should.be.exactly(false);

      M.Set.of(1, 2, 3).equals(M.Set.of(1, 3, 2), true)
        .should.be.exactly(true);

      M.Set.of(1, 2, 3).equals(M.Set.of(1, 4, 2), true)
        .should.be.exactly(false);
    });
  });

  describe('EMPTY / of / fromArray / fromSet', () => {
    it('should have a static property for the empty set', () => {
      should(M.Set.EMPTY().inner().size)
        .be.exactly(0);

      M.Set.EMPTY().toJSON()
        .should.eql([]);

      new M.Set()
        .should.be.exactly(M.Set.of())
        .and.exactly(M.Set.EMPTY());
    });

    it('should be able to create a set from arbitrary parameters', () => {
      const modelicoSet = M.Set.of(0, 1, 1, 2, 3, 5, 8);

      [...modelicoSet]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });

    it('should be able to create a set from an array', () => {
      const fibArray = [0, 1, 1, 2, 3, 5, 8];

      const modelicoSet = M.Set.fromArray(fibArray);

      [...modelicoSet]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });

    it('should be able to create a set from a native set', () => {
      const fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

      const modelicoSet = M.Set.fromSet(fibSet);

      [...modelicoSet]
        .should.eql([0, 1, 2, 3, 5, 8]);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Set.of())
        .should.be.exactly('[object ModelicoSet]');
    });
  });
};

/* eslint-env mocha */

var ModelicoMaybe = (U, should, M, { Person, PartOfDay }) => () => {
  const { _, number, maybe } = M.metadata();

  const authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';

  describe('setting', () => {
    it('should set fields recursively returning a new Maybe', () => {
      const maybe1 = JSON.parse(authorJson, maybe(_(Person)).reviver);
      const maybe2 = maybe1.set('givenName', 'Javi');

      maybe2.getOrElse('').givenName()
        .should.be.exactly('Javi');
    });

    it('should not throw upon setting if empty', () => {
      const maybe = M.Maybe.of(null);

      maybe.set('givenName', 'Javier').isEmpty()
        .should.be.exactly(true);
    });

    it('should return a new maybe with a value when the path is empty', () => {
      const maybe1 = M.Just.of(21);
      const maybe2 = M.Nothing;

      const maybe3 = maybe1.setIn([], 22);
      const maybe4 = maybe2.setIn([], 10);
      const maybe5 = maybe2.setIn([], null);

      should(maybe3.getOrElse(0))
        .be.exactly(22);

      should(maybe4.getOrElse(2))
        .be.exactly(10);

      should(maybe5.getOrElse(2))
        .be.exactly(2);
    });

    it('should return an empty Maybe when setting a path beyond Modélico boundaries', () => {
      const maybe1 = M.Just.of({a: 2});

      const maybe2 = maybe1.setIn([[{a: 1}, 'a']], 200);

      maybe2.isEmpty()
        .should.be.exactly(true);

      M.Just.of(2).set('a', 3).isEmpty()
        .should.be.exactly(true);
    });

    it('should support Maybe of null or undefined', () => {
      should(M.Just.of(null).setIn([], 2).toJSON())
        .be.exactly(2);

      should(M.Just.of(null).set('a', 2).getOrElse(''))
        .be.exactly(null);

      should(M.Just.of().set('a', 2).getOrElse(''))
        .be.exactly(undefined);
    });
  });

  describe('stringifying', () => {
    it('should stringify Maybe values correctly', () => {
      const maybe1 = M.Just.of(2);
      JSON.stringify(maybe1).should.be.exactly('2');

      const maybe2 = M.Nothing;
      JSON.stringify(maybe2).should.be.exactly('null');
    });

    it('should support arbitrary Modélico types', () => {
      const author = M.fromJSON(Person, authorJson);

      const maybe1 = M.Just.of(author);
      JSON.stringify(maybe1).should.be.exactly(authorJson);

      const maybe2 = M.Nothing;
      JSON.stringify(maybe2).should.be.exactly('null');
    });

    it('should support Maybe of null or undefined', () => {
      JSON.stringify(M.Just.of(null))
        .should.be.exactly('null');

      JSON.stringify(M.Just.of())
        .should.be.exactly('null');
    });
  });

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const maybe1 = JSON.parse('2', maybe(number()).reviver);
      should(maybe1.getOrElse(10)).be.exactly(2);

      const maybe2 = JSON.parse('null', maybe(number()).reviver);
      maybe2.isEmpty().should.be.exactly(true);

      const maybe3 = M.genericsFromJS(M.Maybe, [() => number()], 5);
      should(maybe3.getOrElse(0)).be.exactly(5);
    });

    it('should support arbitrary Modélico types', () => {
      const author = JSON.parse(authorJson, _(Person).reviver);

      const myMaybe = JSON.parse(authorJson, maybe(_(Person)).reviver);
      myMaybe.inner().equals(author).should.be.exactly(true);
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
      const maybe = M.Just.of(5);

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
      const maybe = M.Just.of(5);

      should(maybe.getOrElse(7)).be.exactly(5);
    });

    it('should return the provided default if there is nothing', () => {
      const maybe = M.Nothing;

      should(maybe.getOrElse(7)).be.exactly(7);
    });
  });

  describe('map', () => {
    const partOfDayFromJson = _(PartOfDay).reviver.bind(undefined, '');

    it('should apply a function f to the value and return another Maybe with it', () => {
      const maybeFrom1 = M.Just.of(5);
      const maybeFrom2 = M.Just.of('EVENING');

      const maybeTo1 = maybeFrom1.map(x => 2 * x);
      const maybeTo2 = maybeFrom2.map(partOfDayFromJson);

      should(maybeTo1.getOrElse(0)).be.exactly(10);
      should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(PartOfDay.EVENING());
    });

    it('should return a non-empty Maybe of whatever mapped function returns', () => {
      const maybeFrom1 = M.Nothing;
      const maybeFrom2 = M.Just.of(0);

      const maybeTo1 = maybeFrom1.map(x => 2 * x);
      const maybeTo2 = maybeFrom2.map(x => x / x);

      maybeTo1.isEmpty().should.be.exactly(true);
      maybeTo2.isEmpty().should.be.exactly(false);
    });

    it('should compose well', () => {
      const double = x => (x === null) ? 0 : 2 * x;
      const plus5 = x => (x === null) ? 5 : 5 + x;

      const doublePlus5 = x => plus5(double(x));

      const just10 = M.Just.of(10);

      should(just10.map(doublePlus5).inner())
        .be.exactly(just10.map(double).map(plus5).inner())
        .and.exactly(25);

      should(just10.map(x => null).map(plus5).inner())
        .be.exactly(5);
    });
  });

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoMaybe1 = M.Just.of(2);
      const modelicoMaybe2 = M.Just.of(2);

      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
      modelicoMaybe1.should.not.equal(modelicoMaybe2);

      modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
    });

    it('supports non-primitive types', () => {
      const modelicoMaybe1 = M.Just.of(M.Number.of(2));
      const modelicoMaybe2 = M.Just.of(M.Number.of(2));

      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
      modelicoMaybe1.should.not.equal(modelicoMaybe2);

      modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
      modelicoMaybe1.equals(null).should.be.exactly(false);
      modelicoMaybe1.equals().should.be.exactly(false);
    });

    it('handles nothing well', () => {
      const modelicoMaybe1 = M.Just.of(M.Number.of(2));
      const modelicoMaybe2 = M.Nothing;
      const modelicoMaybe3 = M.Maybe.of();

      modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
      modelicoMaybe1.should.not.equal(modelicoMaybe2);

      modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(false);
      modelicoMaybe2.equals(modelicoMaybe3).should.be.exactly(true);
    });

    it('should have same-value-zero semantics', () => {
      M.Just.of(0).equals(M.Just.of(-0)).should.be.exactly(true);
      M.Just.of(NaN).equals(M.Just.of(NaN)).should.be.exactly(true);
    });
  });

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString.call(M.Just.of(1))
        .should.be.exactly('[object ModelicoJust]');

      Object.prototype.toString.call(M.Nothing)
        .should.be.exactly('[object ModelicoNothing]');
    });
  });
};

/* eslint-env mocha */

var asIs = (U, should, M) => () => {
  const { asIs, any, anyOf, string, maybe } = M.metadata();

  describe('toJSON', () => {
    it('should stringify the valfnue as is', () => {
      const mapOfNumbers = M.Map.of('a', 1, 'b', 2);

      JSON.stringify(mapOfNumbers)
        .should.be.exactly('[["a",1],["b",2]]');
    });
  });

  describe('reviver', () => {
    it('should revive the value as is, without the wrapper', () => {
      const asIsObject = JSON.parse('{"two":2}', any().reviver);

      should(asIsObject.two).be.exactly(2);
    });

    it('should support any function', () => {
      const asIsObject = JSON.parse('9', asIs(x => x * 2).reviver);

      should(asIsObject).be.exactly(18);
    });

    it('should not support null (wrap with Maybe)', () => {
      should(() => asIs(String).reviver('', null))
        .throw(/expected a value but got nothing \(null, undefined or NaN\)/);

      maybe(asIs(String)).reviver('', 'aaa').getOrElse('abc')
        .should.be.exactly('aaa');

      maybe(asIs(String)).reviver('', null).getOrElse('abc')
        .should.be.exactly('abc');
    });
  });

  describe('metadata', () => {
    it('should return metadata like type', () => {
      string().type.should.be.exactly(String);

      // using empty anyOf for testing purposes
      const asIsObject = JSON.parse('{"two":2}', anyOf()().reviver);

      should(asIsObject.two).be.exactly(2);
    });

    it('should be immutable', () => {
      (() => { asIs().reviver = x => x; }).should.throw();
    });
  });
};

/* eslint-env mocha */

var setIn = (U, should, M) => () => {
  it('should work across types', () => {
    const hammer = M.Map.of('hammer', 'Can’t Touch This');
    const array1 = M.List.of('totally', 'immutable', hammer);

    should(() => { array1.inner()[1] = 'I’m going to mutate you!'; })
      .throw();

    array1.get(1).should.be.exactly('immutable');

    array1.setIn([2, 'hammer'], 'hm, surely I can mutate this nested object...');

    array1.get(2).inner().get('hammer')
      .should.be.exactly('Can’t Touch This');
  });

  it('should work across types (2)', () => {
    const list = M.List.of('totally', 'immutable');
    const hammer1 = M.Map.fromObject({hammer: 'Can’t Touch This', list});

    hammer1.inner().set('hammer', 'I’m going to mutate you!');
    hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

    hammer1.setIn(['list', 1], 'hm, surely I can mutate this nested object...');

    hammer1.inner().get('list').get(1)
      .should.be.exactly('immutable');
  });
};

/* eslint-env mocha */

var featuresSimple = (should, M) => () => {
  const { _, string } = M.metadata();

  class Animal extends M.Base {
    constructor (props) {
      super(Animal, props);
    }

    speak () {
      const name = this.name();
      return (name === '') ? `I don't have a name` : `My name is ${name}!`
    }

    static innerTypes () {
      return Object.freeze({
        name: string()
      })
    }
  }

  it('should showcase the main features', () => {
    const petJson = `{"name": "Robbie"}`;

    const pet1 = JSON.parse(petJson, _(Animal).reviver);

    pet1.speak()
      .should.be.exactly('My name is Robbie!');

    const pet2 = pet1.set('name', 'Bane');

    pet2.name().should.be.exactly('Bane');
    pet1.name().should.be.exactly('Robbie');
  });
};

/* eslint-env mocha */

var featuresAdvanced = (should, M) => () => {
  const { _, any, maybe, list, string } = M.metadata();

  class Animal extends M.Base {
    constructor (props) {
      super(Animal, props);
    }

    speak () {
      const name = this.name().getOrElse('');

      return (name === '')
        ? `I don't have a name`
        : `My name is ${name}!`
    }

    static innerTypes () {
      return Object.freeze({
        name: maybe(string())
      })
    }
  }

  class Person extends M.Base {
    constructor (props) {
      super(Person, props);
    }

    fullName () {
      return [this.givenName(), this.familyName()].join(' ').trim()
    }

    static innerTypes () {
      return Object.freeze({
        givenName: any(),
        familyName: string(),
        pets: list(maybe(_(Animal)))
      })
    }
  }

  it('should showcase the main features', () => {
    const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [
        {
          "name": "Robbie"
        },
        null
      ]
    }`;

    const person1 = JSON.parse(personJson, _(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    const defaultAnimal = new Animal();

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setIn(['pets', 0, [defaultAnimal, 'name']], 'Bane');

    person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Bane');

    person3.pets().get(1).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Unknown');

    person3.getIn(['pets', 0, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Bane');

    person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Unknown');

    person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Robbie');

    const person4 = person1.setIn(['pets', 1, [defaultAnimal, 'name']], 'Robbie');

    person4.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Robbie');

    person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Unknown');
  });
};

/* eslint-env mocha */

var featuresAdvancedES5 = (should, M) => () => {
  // use ES5 below
  var m = M.metadata();

  function Animal (fields) {
    M.Base.factory(Animal, fields, this);
  }

  Animal.innerTypes = function () {
    return Object.freeze({
      name: m.maybe(m.string())
    })
  };

  Animal.prototype = Object.create(M.Base.prototype);

  Animal.prototype.speak = function () {
    var name = this.name().getOrElse('');

    return (name === '')
      ? "I don't have a name"
      : 'My name is ' + name + '!'
  };

  function Person (fields) {
    M.Base.factory(Person, fields, this);
  }

  Person.innerTypes = function () {
    return Object.freeze({
      givenName: m.string(),
      familyName: m.string(),
      pets: m.list(m.maybe(m._(Animal)))
    })
  };

  Person.prototype = Object.create(M.Base.prototype);

  Person.prototype.fullName = function () {
    return [this.givenName(), this.familyName()].join(' ').trim()
  };

  // use > ES5 below
  it('should showcase the main features', () => {
    const personJson = `{
      "givenName": "Javier",
      "familyName": "Cejudo",
      "pets": [
        {
          "name": "Robbie"
        },
        null
      ]
    }`;

    const person1 = JSON.parse(personJson, m._(Person).reviver);

    person1.fullName().should.be.exactly('Javier Cejudo');

    const person2 = person1.set('givenName', 'Javi');
    person2.fullName().should.be.exactly('Javi Cejudo');
    person1.fullName().should.be.exactly('Javier Cejudo');

    const defaultAnimal = new Animal();

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak()
      .should.be.exactly('My name is Robbie!');

    const person3 = person1.setIn(['pets', 0, [defaultAnimal, 'name']], 'Bane');

    person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('')
      .should.be.exactly('Bane');

    person3.pets().get(1).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Unknown');

    person3.getIn(['pets', 0, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Bane');

    person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Unknown');

    person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('Unknown')
      .should.be.exactly('Robbie');

    const person4 = person1.setIn(['pets', 1, [defaultAnimal, 'name']], 'Robbie');

    person4.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Robbie');

    person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']])
      .should.be.exactly('Unknown');
  });
};

/* eslint-env mocha */

var featuresDeepNesting = (should, M, fixtures) => () => {
  const { _ } = M.metadata();

  it('should revive deeply nested JSON', () => {
    const { Region, countryFactory } = fixtures;
    const City = fixtures.cityFactory(M, Region, countryFactory);
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}`;

    const city = JSON.parse(cityJson, _(City).reviver);

    city.name().should.be.exactly('Pamplona');
    city.country().name().should.be.exactly('Spain');
    city.country().code().should.be.exactly('ESP');
    city.country().region().customMethod().should.be.exactly('Europe (EU)');
  });

  it('should support nested keys with different types', () => {
    const { RegionIncompatibleNameKey: Region, countryFactory } = fixtures;
    const City = fixtures.cityFactory(M, Region, countryFactory);
    const cityJson = `{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":{"id": 1,"value":"EU"}}}}`;

    const city = JSON.parse(cityJson, _(City).reviver);

    city.name().should.be.exactly('Pamplona');
    city.country().name().should.be.exactly('Spain');
    city.country().code().should.be.exactly('ESP');
    city.country().region().customMethod().should.be.exactly('Europe (EU)');
  });
};

/* eslint-env mocha */

var featuresPolymorphic = (should, M, fixtures, {Ajv}) => () => {
  describe('Enumerated: default type field', () => {
    const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER']);
    const { _, number, stringMap, list, anyOf } = M.metadata();

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props);
      }

      getNumbers () {
        const { type, collection } = this;

        switch (type()) {
          case CollectionType.OBJECT():
            return [...collection()[M.symbols.innerOrigSymbol]().values()]
          case CollectionType.ARRAY():
            return [...collection()]
          default:
            throw TypeError(`Unsupported NumberCollection with type ${type().toJSON()}`)
        }
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          type: _(CollectionType),
          collection: anyOf([
            [stringMap(number()), CollectionType.OBJECT()],
            [list(number()), CollectionType.ARRAY()]
          ])
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        type: 'OBJECT',
        collection: {'a': 10, 'b': 25, 'c': 4000}
      });

      should(col1.sum())
        .be.exactly(4035);
    });

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        type: 'ARRAY',
        collection: [1, 2, 3, 4, 3]
      });

      should(col2.sum())
        .be.exactly(13);
    });

    it('should revive polymorphic JSON (3)', () => {
      should(() => M.fromJS(NumberCollection, {
        type: 'OTHER',
        collection: '1,2,3,4,5'
      })).throw(/unsupported enumerator "OTHER" at ""/);
    });
  });

  describe('Enumerated: custom field', () => {
    const CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER']);
    const { _, number, stringMap, list, anyOf } = M.metadata();

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props);
      }

      getNumbers () {
        const { collectionType, collection } = this;

        switch (collectionType()) {
          case CollectionType.OBJECT():
            return [...collection()[M.symbols.innerOrigSymbol]().values()]
          case CollectionType.ARRAY():
            return [...collection()]
          default:
            throw TypeError(`Unsupported NumberCollection with type ${collectionType().toJSON()}`)
        }
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          collectionType: _(CollectionType),
          collection: anyOf([
            [stringMap(number()), CollectionType.OBJECT()],
            [list(number()), CollectionType.ARRAY()]
          ], 'collectionType')
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        collectionType: 'OBJECT',
        collection: {'a': 10, 'b': 25, 'c': 4000}
      });

      should(col1.sum())
        .be.exactly(4035);
    });

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        collectionType: 'ARRAY',
        collection: [1, 2, 3, 4, 3]
      });

      should(col2.sum())
        .be.exactly(13);
    });

    it('should revive polymorphic JSON (3)', () => {
      should(() => M.fromJS(NumberCollection, {
        collectionType: 'OTHER',
        collection: '1,2,3,4,5'
      })).throw(/unsupported enumerator "OTHER" at ""/);
    });
  });

  describe('Based on runtime type field', () => {
    const ajv = Ajv();
    const { _, base, ajvMeta } = M.ajvMetadata(ajv);

    const ShapeType = M.Enum.fromArray(['CIRCLE', 'DIAMOND']);

    const reviver = (k, v) => {
      if (k !== '') {
        return v
      }

      switch (v.type) {
        case ShapeType.CIRCLE().toJSON():
          return new Circle(v)
        case ShapeType.DIAMOND().toJSON():
          return new Diamond(v)
        default:
          throw TypeError('Unsupported or missing shape type in the Shape reviver.')
      }
    };

    class Shape extends M.createAjvModel(ajv, m => ({
      relatedShape: m.ajvMaybe(m._(Shape))
    })) {
      toJSON () {
        const fields = M.fields(this);
        let type;

        switch (this[M.symbols.typeSymbol]()) {
          case Circle:
            type = ShapeType.CIRCLE();
            break
          case Diamond:
            type = ShapeType.DIAMOND();
            break
          default:
            throw TypeError('Unsupported Shape in the toJSON method.')
        }

        return Object.freeze(Object.assign({type}, fields))
      }

      static metadata () {
        const baseMetadata = Object.assign({}, base(Shape), {reviver});

        return ajvMeta(baseMetadata, {}, {}, () => ({
          anyOf: [
            Circle,
            Diamond
          ].map(x => M.getSchema(base(x), false))
        }))
      }
    }

    class Circle extends M.createAjvModel(ajv, m => Object.assign({}, Shape.innerTypes(), {
      radius: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      })
    }), {base: Shape}) {
      constructor (props) {
        super(Circle, props);
      }

      area () {
        return Math.PI * this.radius() ** 2
      }
    }

    class Diamond extends M.createAjvModel(ajv, m => Object.assign({}, Shape.innerTypes(), {
      width: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      }),
      height: m.ajvNumber({
        minimum: 0,
        exclusiveMinimum: true
      })
    }), {base: Shape}) {
      constructor (props) {
        super(Diamond, props);
      }

      area () {
        return this.width() * this.height() / 2
      }
    }

    class Geometer extends M.createAjvModel(ajv, m => ({
      name: m.ajvString({
        minLength: 1
      }),
      favouriteShape: m._(Shape)
    })) {
      constructor (props) {
        super(Geometer, props);
      }
    }

    it('should revive polymorphic JSON', () => {
      const geometer1 = M.fromJS(Geometer, {
        name: 'Audrey',
        favouriteShape: {
          type: 'DIAMOND',
          width: 8,
          height: 7
        }
      });

      const geometer2 = M.fromJS(Geometer, {
        name: 'Javier',
        favouriteShape: {
          type: 'CIRCLE',
          radius: 3
        }
      });

      const geometer3 = new Geometer({
        name: 'Leonardo',
        favouriteShape: new Diamond({
          width: 4,
          height: 12
        })
      });

      should(geometer1.favouriteShape().area())
        .be.exactly(28);

      should(geometer2.favouriteShape().area())
        .be.above(28)
        .and.exactly(Math.PI * 3 ** 2);

      geometer1.toJS().should.deepEqual({
        name: 'Audrey',
        favouriteShape: {
          type: 'DIAMOND',
          relatedShape: null,
          width: 8,
          height: 7
        }
      });

      geometer2.toJS().should.deepEqual({
        name: 'Javier',
        favouriteShape: {
          type: 'CIRCLE',
          relatedShape: null,
          radius: 3
        }
      });

      geometer3.toJS().should.deepEqual({
        name: 'Leonardo',
        favouriteShape: {
          type: 'DIAMOND',
          relatedShape: null,
          width: 4,
          height: 12
        }
      });
    });

    it('should provide its full schema', () => {
      const expectedSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1
          },
          favouriteShape: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [
                      {
                        type: 'null'
                      },
                      {
                        $ref: '#/definitions/3'
                      }
                    ]
                  },
                  radius: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'radius'
                ]
              },
              {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [
                      {
                        type: 'null'
                      },
                      {
                        $ref: '#/definitions/3'
                      }
                    ]
                  },
                  width: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  },
                  height: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'width',
                  'height'
                ]
              }
            ]
          }
        },
        required: [
          'name',
          'favouriteShape'
        ],
        definitions: {
          3: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [
                      {
                        type: 'null'
                      },
                      {
                        $ref: '#/definitions/3'
                      }
                    ]
                  },
                  radius: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'radius'
                ]
              },
              {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [
                      {
                        type: 'null'
                      },
                      {
                        $ref: '#/definitions/3'
                      }
                    ]
                  },
                  width: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  },
                  height: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: [
                  'width',
                  'height'
                ]
              }
            ]
          }
        }
      };

      const actualSchema = M.getSchema(_(Geometer));

      actualSchema.should.deepEqual(expectedSchema);
    });
  });

  describe('Based on value only', () => {
    const { number, stringMap, list } = M.metadata();

    class NumberCollection extends M.Base {
      constructor (props) {
        super(NumberCollection, props);
      }

      getNumbers () {
        const collection = this.collection();

        return (collection[M.symbols.typeSymbol]() === M.List)
          ? [...collection]
          : [...collection[M.symbols.innerOrigSymbol]().values()]
      }

      sum () {
        return this.getNumbers().reduce((acc, x) => acc + x, 0)
      }

      static innerTypes () {
        return Object.freeze({
          collection: v => Array.isArray(v.collection)
            ? list(number())
            : stringMap(number())
        })
      }
    }

    it('should revive polymorphic JSON (1)', () => {
      const col1 = M.fromJS(NumberCollection, {
        collection: {a: 10, b: 25, c: 4000}
      });

      should(col1.sum())
        .be.exactly(4035);
    });

    it('should revive polymorphic JSON (2)', () => {
      const col2 = M.fromJS(NumberCollection, {
        collection: [1, 2, 3, 4, 3]
      });

      should(col2.sum())
        .be.exactly(13);
    });
  });
};

/* eslint-env mocha */

var ImmutableExamples = (U, should, M) => () => {
  const objToArr = U.objToArr;

  it('Getting started', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3});
    const map2 = map1.set('b', 50);
    should(map1.inner().get('b')).be.exactly(2);
    should(map2.inner().get('b')).be.exactly(50);
  });

  it('The case for Immutability', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3});
    const map2 = map1.set('b', 2);
    map1.equals(map2).should.be.exactly(true);
    const map3 = map1.set('b', 50);
    map1.equals(map3).should.be.exactly(false);
  });

  it('JavaScript-first API', () => {
    const list1 = M.List.of(1, 2);

    const list2Array = [...list1];
    list2Array.push(3, 4, 5);
    const list2 = M.List.fromArray(list2Array);

    const list3Array = [...list2];
    list3Array.unshift(0);
    const list3 = M.List.fromArray(list3Array);

    const list4 = M.List.fromArray([...list1].concat([...list2], [...list3]));

    should(list1.size === 2).be.exactly(true);
    should(list2.size === 5).be.exactly(true);
    should(list3.size === 6).be.exactly(true);
    should(list4.size === 13).be.exactly(true);
    should(list4.get(0) === 1).be.exactly(true);
  });

  it('JavaScript-first API (2)', () => {
    const alpha = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4});
    [...alpha].map(kv => kv[0].toUpperCase()).join()
      .should.be.exactly('A,B,C,D');
  });

  it('Accepts raw JavaScript objects.', () => {
    const map1 = M.Map.fromObject({a: 1, b: 2, c: 3, d: 4});
    const map2 = M.Map.fromObject({c: 10, a: 20, t: 30});

    const obj = {d: 100, o: 200, g: 300};

    const map3 = M.Map.fromMap(
      new Map([].concat([...map1], [...map2], objToArr(obj)))
    );

    map3.equals(M.Map.fromObject({a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300}))
      .should.be.exactly(true);
  });

  it('Accepts raw JavaScript objects. (2)', () => {
    const myObject = {a: 1, b: 2, c: 3};

    objToArr(myObject).reduce((acc, kv) => {
      acc[kv[0]] = Math.pow(kv[1], 2);
      return acc
    }, {}).should.eql({a: 1, b: 4, c: 9});
  });

  it('Accepts raw JavaScript objects. (3)', () => {
    const obj = { 1: 'one' };
    Object.keys(obj)[0].should.be.exactly('1');
    obj['1'].should.be.exactly('one');
    obj[1].should.be.exactly('one');

    const map = M.Map.fromObject(obj);
    map.inner().get('1').should.be.exactly('one');
    should(map.inner().get(1)).be.exactly(undefined);
  });

  it('Equality treats Collections as Data', () => {
    const map1 = M.Map.fromObject({a: 1, b: 1, c: 1});
    const map2 = M.Map.fromObject({a: 1, b: 1, c: 1});

    should(map1 !== map2).be.exactly(true); // two different instances
    map1.equals(map2).should.be.exactly(true); // have equivalent values
  });

  it('Batching Mutations', () => {
    const list1 = M.List.of(1, 2, 3);
    const list2Array = [...list1];
    list2Array.push(4, 5, 6);
    const list2 = M.List.fromArray(list2Array);

    should([...list1].length === 3).be.exactly(true);
    should([...list2].length === 6).be.exactly(true);
  });
};

/* eslint-env mocha */

var ImmutableProxied = (U, should, M) => () => {
  const _m = M.proxyMap;
  const _l = M.proxyList;

  const objToArr = U.objToArr;

  it('Getting started (proxied)', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    const map2 = map1.set('b', 50);
    should(map1.get('b')).be.exactly(2);
    should(map2.get('b')).be.exactly(50);
  });

  it('The case for Immutability', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));
    const map2 = map1.set('b', 2);
    map1.equals(map2).should.be.exactly(true);
    const map3 = map1.set('b', 50);
    map1.equals(map3).should.be.exactly(false);
  });

  it('JavaScript-first API', () => {
    const list1 = _l(M.List.of(1, 2));

    const list2 = list1.push(3, 4, 5);
    const list3 = list2.unshift(0);
    const list4 = list1.concat([...list2], [...list3]);

    should(list1.size === 2).be.exactly(true);
    should(list2.size === 5).be.exactly(true);
    should(list3.size === 6).be.exactly(true);
    should(list4.size === 13).be.exactly(true);
    should(list4.get(0) === 1).be.exactly(true);
  });

  it('JavaScript-first API (2)', () => {
    const alpha = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));

    const res = [];
    alpha.forEach((v, k) => res.push(k.toUpperCase()));
    res.join().should.be.exactly('A,B,C,D');
  });

  it('Accepts raw JavaScript objects.', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 2, c: 3, d: 4}));
    const map2 = _m(M.Map.fromObject({c: 10, a: 20, t: 30}));

    const obj = {d: 100, o: 200, g: 300};

    const map3 = M.Map.fromMap(
      new Map([].concat([...map1.entries()], [...map2.entries()], objToArr(obj)))
    );

    map3.equals(M.Map.fromObject({a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300}))
      .should.be.exactly(true);
  });

  it('Accepts raw JavaScript objects. (2)', () => {
    const map = _m(M.Map.fromObject({a: 1, b: 2, c: 3}));

    const res = {};
    map.forEach((v, k) => { res[k] = v * v; });
    res.should.eql({a: 1, b: 4, c: 9});
  });

  it('Accepts raw JavaScript objects. (3)', () => {
    const obj = { 1: 'one' };
    Object.keys(obj)[0].should.be.exactly('1');
    obj['1'].should.be.exactly('one');
    obj[1].should.be.exactly('one');

    const map = _m(M.Map.fromObject(obj));
    map.get('1').should.be.exactly('one');
    should(map.get(1)).be.exactly(undefined);
  });

  it('Equality treats Collections as Data', () => {
    const map1 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));
    const map2 = _m(M.Map.fromObject({a: 1, b: 1, c: 1}));

    should(map1 !== map2).be.exactly(true);   // two different instances
    map1.equals(map2).should.be.exactly(true); // have equivalent values
  });

  it('Batching Mutations', () => {
    const list1 = _l(M.List.of(1, 2, 3));

    const res = [...list1];
    res.push(4);
    res.push(5);
    res.push(6);
    const list2 = _l(M.List.fromArray(res));

    should(list1.length === 3).be.exactly(true);
    should(list2.length === 6).be.exactly(true);
  });
};

/* eslint-env mocha */

var proxyMap = (should, M) => () => {
  const p = M.proxyMap;

  it('size', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    (map.size).should.be.exactly(3);
  });

  it('get() / set() / delete() / clear()', () => {
    const map1 = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    const map2 = map1.set('b', 50);

    (map1.get('b')).should.be.exactly(2);
    (map2.get('b')).should.be.exactly(50);

    const map3 = map2.delete('c');

    (map2.get('c')).should.be.exactly(3);
    (map3.has('c')).should.be.exactly(false);

    const map4 = map3.clear();

    (map3.size).should.be.exactly(2);
    (map4.size).should.be.exactly(0);
  });

  it('entries()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    [...map.entries()]
      .should.eql([['a', 1], ['b', 2], ['c', 3]]);
  });

  it('values() / keys() / [@@iterator]()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    [...map.values()]
      .should.eql([1, 2, 3]);

    [...map.keys()]
      .should.eql(['a', 'b', 'c']);

    [...map[Symbol.iterator]()]
      .should.eql([['a', 1], ['b', 2], ['c', 3]]);
  });

  it('forEach()', () => {
    const map = p(M.Map.fromObject({a: 1, b: 2, c: 3}));

    let sum = 0;
    let keys = '';

    map.forEach((v, k) => {
      sum += v;
      keys += k.toUpperCase();
    });

    (sum).should.be.exactly(6);
    (keys).should.be.exactly('ABC');
  });
};

/* eslint-env mocha */

var proxyList = (should, M) => () => {
  const p = M.proxyList;

  it('length', () => {
    const list1 = p(M.List.of(1, 2, 2, 3));

    should(list1.length).be.exactly(4);
  });

  it('[n]', () => {
    const list1 = p(M.List.of(1, 2, 2, 3));

    list1.get(0).should.be.exactly(1);
    list1.get(1).should.be.exactly(2);
    list1.get(2).should.be.exactly(2);
    list1.get(3).should.be.exactly(3);

    list1[0].should.be.exactly(1);
    list1[1].should.be.exactly(2);
    list1[2].should.be.exactly(2);
    list1[3].should.be.exactly(3);

    should(list1[4]).be.exactly(undefined);
    should(list1.get(4)).be.exactly(undefined);

    list1.get('0').should.be.exactly(1);
    list1.get('1').should.be.exactly(2);
    list1.get('2').should.be.exactly(2);
    list1.get('3').should.be.exactly(3);

    list1['0'].should.be.exactly(1);
    list1['1'].should.be.exactly(2);
    list1['2'].should.be.exactly(2);
    list1['3'].should.be.exactly(3);

    should(list1['4']).be.exactly(undefined);
    should(list1.get('4')).be.exactly(undefined);
  });

  it('includes()', () => {
    const list = p(M.List.of(1, 2, 3));

    list.includes(2)
      .should.be.exactly(true);

    list.includes(4)
      .should.be.exactly(false);

    list.includes(3, 3)
      .should.be.exactly(false);

    list.includes(3, -1)
      .should.be.exactly(true);

    p(M.List.of(1, 2, NaN)).includes(NaN)
      .should.be.exactly(true);
  });

  it('join()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    list.join('-')
      .should.be.exactly('1-2-2-3');
  });

  it('indexOf()', () => {
    const list = p(M.List.of(2, 9, 9));

    list.indexOf(2)
      .should.be.exactly(0);

    list.indexOf(7)
      .should.be.exactly(-1);

    list.indexOf(9, 2)
      .should.be.exactly(2);

    list.indexOf(9)
      .should.be.exactly(1);

    list.indexOf(2, -1)
      .should.be.exactly(-1);

    list.indexOf(2, -3)
      .should.be.exactly(0);
  });

  it('lastIndexOf()', () => {
    const list = p(M.List.of(2, 5, 9, 2));

    list.lastIndexOf(2)
      .should.be.exactly(3);

    list.lastIndexOf(7)
      .should.be.exactly(-1);

    list.lastIndexOf(2, 3)
      .should.be.exactly(3);

    list.lastIndexOf(2, 2)
      .should.be.exactly(0);

    list.lastIndexOf(2, -2)
      .should.be.exactly(0);

    list.lastIndexOf(2, -1)
      .should.be.exactly(3);
  });

  it('concat()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    list.concat(100).toJSON()
      .should.eql([1, 2, 2, 3, 100]);

    list.concat([100, 200]).toJSON()
      .should.eql([1, 2, 2, 3, 100, 200]);
  });

  it('slice()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    list.slice(1).toJSON()
      .should.eql([2, 2, 3]);

    list.slice(2).set(0, 100).toJSON()
      .should.eql([100, 3]);

    list.slice(2).toJSON()
      .should.eql([2, 3]);

    list.slice(-3).toJSON()
      .should.eql([2, 2, 3]);

    list.slice(0, -2).toJSON()
      .should.eql([1, 2]);
  });

  it('filter()', () => {
    const list = p(M.List.of(1, 2, 3));

    list.filter(x => (x % 2 === 1)).toJSON()
      .should.eql([1, 3]);
  });

  it('forEach()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    let sum = 0;
    list.forEach(x => { sum += x; });

    should(sum).be.exactly(8);
  });

  it('keys() / entries() / [@@iterator]()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    Array.from(list.entries())
      .should.eql([[0, 1], [1, 2], [2, 2], [3, 3]]);

    Array.from(list.keys())
      .should.eql([0, 1, 2, 3]);

    Array.from(list[Symbol.iterator]())
      .should.eql([1, 2, 2, 3]);
  });

  it('every() / some()', () => {
    const list = p(M.List.of(1, 2, 3));

    list.every(x => x < 5)
      .should.be.exactly(true);

    list.every(x => x < 3)
      .should.be.exactly(false);

    list.some(x => x > 5)
      .should.be.exactly(false);

    list.some(x => x < 3)
      .should.be.exactly(true);
  });

  it('find() / findIndex()', () => {
    const list = p(M.List.of(2, 5, 9, 2));

    const multipleOf = x => n => (n % x === 0);

    list.find(multipleOf(3))
      .should.be.exactly(9);

    list.findIndex(multipleOf(3))
      .should.be.exactly(2);
  });

  it('reduce() / reduceRight()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    list.reduce((a, b) => a + b, 0)
      .should.be.exactly(8);

    list.reduce((str, x) => str + x, '')
      .should.be.exactly('1223');

    list.reduceRight((str, x) => str + x, '')
      .should.be.exactly('3221');
  });

  it('reverse()', () => {
    const list = p(M.List.of(1, 2, 2, 3));

    list.reverse().toJSON()
      .should.eql([3, 2, 2, 1]);

    list.toJSON()
      .should.eql([1, 2, 2, 3]);
  });

  it('copyWithin()', () => {
    const list = p(M.List.of(1, 2, 3, 4, 5));

    list.copyWithin(-2).toJSON()
      .should.eql([1, 2, 3, 1, 2]);

    list.copyWithin(0, 3).toJSON()
      .should.eql([4, 5, 3, 4, 5]);

    list.copyWithin(0, 3, 4).toJSON()
      .should.eql([4, 2, 3, 4, 5]);

    list.copyWithin(-2, -3, -1).toJSON()
      .should.eql([1, 2, 3, 3, 4]);
  });

  it('fill()', () => {
    const list = p(M.List.of(1, 2, 3));

    list.fill(4).toJSON()
      .should.eql([4, 4, 4]);

    list.fill(4, 1, 2).toJSON()
      .should.eql([1, 4, 3]);

    list.fill(4, 1, 1).toJSON()
      .should.eql([1, 2, 3]);

    list.fill(4, -3, -2).toJSON()
      .should.eql([4, 2, 3]);

    list.fill(4, NaN, NaN).toJSON()
      .should.eql([1, 2, 3]);

    p(M.List.fromArray(Array(3))).fill(4).toJSON()
      .should.eql([4, 4, 4]);
  });

  it('sort()', () => {
    const list = p(M.List.of(1, 2, 5, 4, 3));

    Array.from(list.sort())
      .should.eql([1, 2, 3, 4, 5]);

    Array.from(list.sort())
      .should.eql([1, 2, 3, 4, 5]);
  });

  it('sort(fn)', () => {
    const list = p(M.List.of(1, 2, 5, 4, 3));

    const isEven = n => (n % 2 === 0);

    const evensBeforeOdds = (a, b) => {
      if (isEven(a)) {
        return isEven(b) ? a - b : -1
      }

      return isEven(b) ? 1 : a - b
    };

    list.sort(evensBeforeOdds).toJSON()
      .should.eql([2, 4, 1, 3, 5]);
  });

  it('map()', () => {
    const list = p(M.List.of(1, 2, 3));

    list.map(x => x + 10)
      .should.eql([11, 12, 13]);
  });
};

/* eslint-env mocha */

var proxySet = (should, M) => () => {
  const p = M.proxySet;

  it('size', () => {
    const set = p(M.Set.of(1, 2, 2, 3));

    (set.size).should.be.exactly(3);
  });

  it('has() / add() / delete() / clear()', () => {
    const set1 = p(M.Set.of(1, 2, 2, 3));

    (set1.has(3)).should.be.exactly(true);
    (set1.has(50)).should.be.exactly(false);

    const set2 = set1.add(50);

    (set1.has(50)).should.be.exactly(false);
    (set2.has(50)).should.be.exactly(true);

    const set3 = set2.delete(50);

    (set2.has(50)).should.be.exactly(true);
    (set3.has(50)).should.be.exactly(false);

    const set4 = set1.clear();

    (set4.size).should.be.exactly(0);
  });

  it('entries()', () => {
    const set = p(M.Set.of(1, 2, 2, 3));

    [...set.entries()]
      .should.eql([[1, 1], [2, 2], [3, 3]]);
  });

  it('values() / keys() / [@@iterator]()', () => {
    const set = p(M.Set.of(1, 2, 2, 3));

    [...set.values()]
      .should.eql([1, 2, 3]);

    [...set.keys()]
      .should.eql([1, 2, 3]);

    [...set[Symbol.iterator]()]
      .should.eql([1, 2, 3]);
  });

  it('forEach()', () => {
    const set = p(M.Set.of(1, 2, 2, 3));

    let sum = 0;
    set.forEach(x => { sum += x; });

    (sum).should.be.exactly(6);
  });
};

/* eslint-env mocha */

var proxyDate = (should, M) => () => {
  const p = M.proxyDate;

  it('getters / setters', () => {
    const date1 = p(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

    const date2 = date1.setFullYear(2015);
    const date3 = date2.setMinutes(55);

    date2.getFullYear()
      .should.be.exactly(2015);

    date1.getFullYear()
      .should.be.exactly(1988);

    date1.getMinutes()
      .should.be.exactly(0);

    date3.getMinutes()
      .should.be.exactly(55);
  });
};

/* eslint-env mocha */

var c51 = (should, M) => () => {
  const { string } = M.metadata();

  class Country extends M.Base {
    constructor (code) {
      super(Country, {code});
    }

    static innerTypes () {
      return Object.freeze({
        code: string()
      })
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP');
  });
};

/* eslint-env mocha */

var cases = (should, M) => () => {
  describe('51: root elements', c51(should, M));
};

/* eslint-env mocha */

var personFactory = (M, PartOfDay, Sex) => {
  const joinWithSpace = (...parts) => parts.join(' ').trim();

  const { _, string, date, map, list, set, maybe } = M.metadata();
  const partOfDay = PartOfDay.metadata;
  const sex = Sex.metadata;

  class Person extends M.Base {
    constructor (props) {
      super(Person, props);
    }

    fullName () {
      return joinWithSpace(this.givenName(), this.familyName())
    }

    static innerTypes () {
      return Object.freeze({
        givenName: string(),
        familyName: string(),

        birthday: _(M.Date),
        // alternative (leaving the above for testing purposes)
        // birthday: date(),

        favouritePartOfDay: partOfDay(),
        lifeEvents: map(string(), date()),
        importantDatesList: list(date()),
        importantDatesSet: set(date()),
        sex: maybe(sex())
      })
    }
  }

  return Object.freeze(Person)
};

/* eslint-env mocha */

const range = (minTime, maxTime) => ({minTime, maxTime});

var partOfDayFactory = M => {
  class PartOfDay extends M.Enum {
    static innerTypes () {
      return M.Enum.innerTypes()
    }
  }

  return M.Enum.fromObject({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  }, PartOfDay, 'PartOfDay')
};

/* eslint-env mocha */

var sexFactory = M => M.Enum.fromArray(['FEMALE', 'MALE', 'OTHER']);

/* eslint-env mocha */

var animalFactory = M => {
  const { string } = M.metadata();

  class Animal extends M.Base {
    constructor (props) {
      super(Animal, props);
    }

    speak () {
      return 'hello'
    }

    static innerTypes () {
      return Object.freeze({
        name: string()
      })
    }
  }

  return Object.freeze(Animal)
};

/* eslint-env mocha */

var friendFactory = M => {
  const { _, string, maybe } = M.metadata();

  class Friend extends M.Base {
    constructor (props) {
      super(Friend, props);
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        bestFriend: maybe(_(Friend))
      })
    }
  }

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Nothing
  });

  return Object.freeze(Friend)
};

/* eslint-env mocha */

var cityFactory = (M, Region, countryFactory) => {
  const Country = countryFactory(M, Region);
  const { _, string } = M.metadata();

  class City extends M.Base {
    constructor (props) {
      super(City, props);
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        country: _(Country)
      })
    }
  }

  return Object.freeze(City)
};

/* eslint-env mocha */

var countryFactory = (M, Region) => {
  const { _, string } = M.metadata();

  class Country extends M.Base {
    constructor (props) {
      super(Country, props);
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        code: string(),
        region: _(Region)
      })
    }
  }

  return Object.freeze(Country)
};

/* eslint-env mocha */

var regionFactory = M => {
  const { string } = M.metadata();

  class Region extends M.Base {
    constructor (props) {
      super(Region, props);
    }

    customMethod () {
      return `${this.name()} (${this.code()})`
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        code: string()
      })
    }
  }

  return Object.freeze(Region)
};

/* eslint-env mocha */

var regionIncompatibleNameKeyFactory = M => {
  const { _, number, string } = M.metadata();

  class Code extends M.Base {
    constructor (props) {
      super(Code, props);
    }

    static innerTypes () {
      return Object.freeze({
        id: number(),
        value: string()
      })
    }
  }

  class Region extends M.Base {
    constructor (props) {
      super(Region, props);
    }

    customMethod () {
      return `${this.name()} (${this.code().value()})`
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        code: _(Code)
      })
    }
  }

  return Object.freeze(Region)
};

var currencyFactory = ({M}) => {
  return M.Enum.fromArray([
    'AUD',
    'BGN',
    'BRL',
    'CAD',
    'CHF',
    'CNY',
    'CZK',
    'DKK',
    'EUR',
    'GBP',
    'HKD',
    'HRK',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'JPY',
    'KRW',
    'MXN',
    'MYR',
    'NOK',
    'NZD',
    'PHP',
    'PLN',
    'RON',
    'RUB',
    'SEK',
    'SGD',
    'THB',
    'TRY',
    'USD',
    'ZAR'
  ])
};

var localDateFactory = ({M, Ajv, validationEnabled, ajvOptions}) => {
  const {
    base, ajvMeta
  } = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined);

  const reviver = (k, v) =>
    new LocalDate(...v.split('-').map(Number));

  class LocalDate extends M.Base {
    constructor (year, month, day) {
      super(LocalDate, {year, month, day});

      this.year = () => year;
      this.month = () => month;
      this.day = () => day;

      Object.freeze(this);
    }

    toJSON () {
      const { year, month, day } = this;

      return `${year()}-${month()}-${day()}`
    }

    static metadata () {
      const baseMetadata = Object.assign({}, base(LocalDate), {reviver});

      // baseMetadata as a function for testing purposes
      return ajvMeta(() => baseMetadata, {
        type: 'string',
        pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
      })
    }
  }

  return LocalDate
};

var fixerIoResultFactory = (
  {M, Ajv, validationEnabled, ajvOptions},
  [Currency, LocalDate]
) => {
  const {
    _, ajvEnum, ajvEnumMap, ajvNumber
  } = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined);

  class FixerIoResult extends M.Base {
    constructor (fields) {
      // ensure base is included in the rates
      const rates = fields.rates.set(fields.base, 1);
      const enhancedFields = Object.assign({}, fields, {rates});

      super(FixerIoResult, enhancedFields);
      Object.freeze(this);
    }

    convert (from, to, x) {
      const rates = this.rates();

      return x * rates.get(to) / rates.get(from)
    }

    static innerTypes () {
      return Object.freeze({
        base: ajvEnum(Currency),
        date: _(LocalDate),
        rates: ajvEnumMap({},
          ajvEnum(Currency),
          ajvNumber({minimum: 0, exclusiveMinimum: true})
        )
      })
    }
  }

  return FixerIoResult
};

var fixerIoFactory = ({
  M,
  Ajv,
  ajvOptions = {},
  validationEnabled = true
} = {}) => {
  const options = {M, Ajv, ajvOptions, validationEnabled};
  const Currency = currencyFactory({M});
  const LocalDate = localDateFactory(options);

  return Object.freeze({
    Currency,
    FixerIoResult: fixerIoResultFactory(options, [Currency, LocalDate])
  })
};

/* eslint-env mocha */

const json = `
{
  "base": "EUR",
  "date": "2017-03-02",
  "rates": {
    "AUD": 1.384,
    "BGN": 1.9558,
    "BRL": 3.2687,
    "CAD": 1.4069,
    "CHF": 1.0651,
    "CNY": 7.2399,
    "CZK": 27.021,
    "DKK": 7.4336,
    "GBP": 0.8556,
    "HKD": 8.1622,
    "HRK": 7.4193,
    "HUF": 308.33,
    "IDR": 14045,
    "ILS": 3.881,
    "INR": 70.2,
    "JPY": 120.24,
    "KRW": 1204.3,
    "MXN": 20.95,
    "MYR": 4.6777,
    "NOK": 8.883,
    "NZD": 1.4823,
    "PHP": 52.997,
    "PLN": 4.2941,
    "RON": 4.522,
    "RUB": 61.68,
    "SEK": 9.5195,
    "SGD": 1.484,
    "THB": 36.804,
    "TRY": 3.8972,
    "USD": 1.0514,
    "ZAR": 13.78
  }
}
`;

var fixerIoSpec = (should, M, { fixerIoFactory }, { Ajv }) => () => {
  const { _ } = M.metadata();
  const { FixerIoResult, Currency } = fixerIoFactory({M, Ajv});

  it('should parse results from fixer.io', () => {
    const fixerIoResult = M.fromJSON(FixerIoResult, json);

    fixerIoResult.base().should.be.exactly(Currency.EUR());

    fixerIoResult.date().year().should.be.exactly(2017);
    fixerIoResult.date().month().should.be.exactly(3);
    fixerIoResult.date().day().should.be.exactly(2);

    fixerIoResult.rates().get(Currency.AUD()).should.be.exactly(1.384);
  });

  it('should convert between any available currencies', () => {
    const { GBP, USD, EUR, AUD, CNY } = Currency;

    const fixerIoResult = M.fromJSON(FixerIoResult, json);

    fixerIoResult.convert(GBP(), USD(), 7.20).toFixed(2)
      .should.be.exactly('8.85');

    fixerIoResult.convert(EUR(), AUD(), 15).toFixed(2)
      .should.be.exactly('20.76');

    fixerIoResult.convert(CNY(), EUR(), 500).toFixed(2)
      .should.be.exactly('69.06');
  });

  it('should generate the right schema', () => {
    const schema = M.getSchema(_(FixerIoResult));

    const expectedSchema = {
      type: 'object',
      properties: {
        base: {
          enum: [
            'AUD',
            'BGN',
            'BRL',
            'CAD',
            'CHF',
            'CNY',
            'CZK',
            'DKK',
            'EUR',
            'GBP',
            'HKD',
            'HRK',
            'HUF',
            'IDR',
            'ILS',
            'INR',
            'JPY',
            'KRW',
            'MXN',
            'MYR',
            'NOK',
            'NZD',
            'PHP',
            'PLN',
            'RON',
            'RUB',
            'SEK',
            'SGD',
            'THB',
            'TRY',
            'USD',
            'ZAR'
          ]
        },
        date: {
          type: 'string',
          pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
        },
        rates: {
          type: 'object',
          maxProperties: 32,
          additionalProperties: false,
          patternProperties: {
            '^(AUD|BGN|BRL|CAD|CHF|CNY|CZK|DKK|EUR|GBP|HKD|HRK|HUF|IDR|ILS|INR|JPY|KRW|MXN|MYR|NOK|NZD|PHP|PLN|RON|RUB|SEK|SGD|THB|TRY|USD|ZAR)$': {
              type: 'number',
              minimum: 0,
              exclusiveMinimum: true
            }
          }
        }
      },
      required: [
        'base',
        'date',
        'rates'
      ]
    };

    schema.should.deepEqual(expectedSchema);

    Ajv().validate(schema, JSON.parse(json))
      .should.be.exactly(true);
  });
};

/* eslint-env mocha */
var ajvMetadata = (should, M, fixtures, { Ajv }) => () => {
  const {
    ajv_,
    ajvBase,
    ajvAsIs,
    ajvAny,
    ajvString,
    ajvNumber,
    ajvBoolean,
    ajvDate,
    ajvEnum,
    ajvEnumMap,
    ajvList,
    ajvMap,
    ajvStringMap,
    ajvSet,
    ajvMaybe,
    ajvWithDefault,
    ajvAnyOf,

    // normal
    _,
    base,
    number
  } = M.ajvMetadata(Ajv());

  describe('Animal example', () => {
    class Animal extends M.Base {
      constructor (props) {
        super(Animal, props);
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
          dimensions:
            ajvMaybe(
              ajvList({ minItems: 3, maxItems: 3 },
                ajvNumber({ minimum: 0, exclusiveMinimum: true })))
        })
      }
    }

    class Animal2 extends M.Base {
      constructor (props) {
        super(Animal, props);
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString({ minLength: 1, maxLength: 25 }),
          dimensions:
            ajvMaybe(
              ajvList({ minItems: 3, maxItems: 3 },
                number()))
        })
      }
    }

    it('should revive as usual with valid JSON', () => {
      const bane1 = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      });

      bane1.name().should.be.exactly('Bane');

      bane1.dimensions().getOrElse([1, 1, 1]).equals(M.List.of(20, 55, 65))
        .should.be.exactly(true);
    });

    it('should allow additional properties by default', () => {
      M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65],
        extra: 1
      }).should.not.throw();
    });

    it('should fail with invalid JSON', () => {
      should(() => M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 0]
      }))
        .throw(/Invalid JSON at "dimensions -> 2"/)
        .and.throw(/should be > 0/);
    });

    it('should be able to return the whole schema', () => {
      const bane = M.fromJS(Animal, {
        name: 'Bane',
        dimensions: [20, 55, 65]
      });

      const animalNormalMeta = _(fixtures.Animal);
      const animalNormalMetaSchema = M.getSchema(animalNormalMeta);

      animalNormalMetaSchema
        .should.deepEqual({
          type: 'object',
          properties: {
            name: {}
          },
          required: ['name']
        });

      const animalMeta = ajv_(Animal);
      const animal1Schema1 = M.getSchema(animalMeta);
      const animal1Schema2 = M.getSchema(animalMeta);

      animal1Schema1
        .should.deepEqual(animal1Schema2)
        .and.deepEqual({
          type: 'object',
          properties: {
            name: {
              default: 'unknown',
              anyOf: [
                { type: 'null' },
                {
                  default: 'unknown',
                  type: 'string',
                  minLength: 1,
                  maxLength: 25
                }
              ]
            },
            dimensions: {
              anyOf: [
                { type: 'null' },
                {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'number',
                    exclusiveMinimum: true,
                    minimum: 0
                  }
                }
              ]
            }
          }
        });

      const animalSchema2 = M.getSchema(ajv_(Animal2));

      animalSchema2
        .should.deepEqual({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 25
            },
            dimensions: {
              anyOf: [
                { type: 'null' },
                {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {}
                }
              ]
            }
          },
          required: ['name']
        });

      const ajv = Ajv();

      ajv.validate(animal1Schema1, bane.toJS())
        .should.be.exactly(true);

      ajv.validate(animal1Schema1, bane.set('name', 'Robbie').toJS())
        .should.be.exactly(true);

      ajv.validate(animal1Schema1, bane.set('name', 2).toJS())
        .should.be.exactly(false);
    });
  });

  describe('deeply nested error examples', () => {
    it('list', () => {
      should(() => M.ajvGenericsFromJSON(ajv_, M.List, {}, [
        ajvList({}, ajvList({}, ajvNumber({minimum: 5})))
      ], '[[[10], [6, 7, 4]]]'))
        .throw(/Invalid JSON at "0 -> 1 -> 2"/)
        .and.throw(/should be >= 5/);
    });

    it('set', () => {
      should(() => M.genericsFromJS(M.Set, [
        ajvSet({}, ajvSet({}, ajvNumber({minimum: 5})))
      ], [[[10], [6, 7, 9, 4]]]))
        .throw(/Invalid JSON at "0 -> 1 -> 3"/)
        .and.throw(/should be >= 5/);
    });

    it('stringMap', () => {
      should(() => M.genericsFromJS(M.StringMap, [
        ajvStringMap({}, ajvStringMap({}, ajvNumber({minimum: 5})))
      ], {a: {b1: {c: 10}, b2: {d1: 6, d2: 7, d3: 4}}}))
        .throw(/Invalid JSON at "a -> b2 -> d3"/)
        .and.throw(/should be >= 5/);
    });

    it('map', () => {
      should(() => M.genericsFromJS(M.Map, [
        ajvString(),
        ajvMap({}, ajvString(), ajvNumber({minimum: 5}))
      ], [['A', [['A', 6], ['B', 7], ['C', 4]]]]))
        .throw(/Invalid JSON at "0 -> 1 -> 2 -> 1"/)
        .and.throw(/should be >= 5/);

      should(() => M.genericsFromJS(M.Map, [
        ajvString(),
        ajvMap({}, ajvString(), ajvNumber({minimum: 5}))
      ], [['A', [['A', 6], ['B', 7], [2, 7]]]]))
        .throw(/Invalid JSON at "0 -> 1 -> 2 -> 0"/)
        .and.throw(/should be string/);
    });

    it('enumMap', () => {
      const SideEnum = M.Enum.fromArray(['A', 'B']);

      should(() => M.genericsFromJS(M.EnumMap, [
        ajv_(SideEnum),
        ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({minimum: 5})))
      ], {A: {A: {A: 10}, B: {A: 4, B: 7}}}))
        .throw(/Invalid JSON at "A -> B -> A"/)
        .and.throw(/should be >= 5/);

      should(() => M.genericsFromJS(M.EnumMap, [
        ajv_(SideEnum),
        ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({minimum: 5})))
      ], {A: {A: {A: 10}, B: {D: 5, B: 7}}}))
        .throw(/Invalid JSON at "A -> B"/)
        .and.throw(/should NOT have additional properties/);
    });
  });

  describe('togglability', () => {
    const { ajvString: nonValidatedString } = M.ajvMetadata();

    it('defaults to normal behaviour when Ajv is undefined', () => {
      JSON.parse('"aa"', nonValidatedString({ minLength: 3 }).reviver)
        .should.be.exactly('aa');

      should(() => JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/);
    });
  });

  describe('asIs', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', ajvAsIs().reviver)
        .should.be.exactly('test');
    });

    it('supports valid values with schema', () => {
      JSON.parse('"test"', ajvAsIs({ type: 'string' }).reviver)
        .should.be.exactly('test');
    });

    it('supports valid values with schema and transformer', () => {
      JSON.parse('"test"', ajvAsIs({ type: 'string', maxLength: 5 }, x => x.repeat(2)).reviver)
        .should.be.exactly('testtest');
    });

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', ajvAsIs({ type: 'string' }).reviver))
        .throw(/should be string/);

      should(() => JSON.parse('"testtest"', ajvAsIs({ type: 'string', maxLength: 5 }).reviver))
        .throw(/should NOT be longer than 5 characters/);
    });
  });

  describe('any', () => {
    it('supports missing schema', () => {
      JSON.parse('"test"', ajvAny().reviver)
        .should.be.exactly('test');

      should(JSON.parse('1', ajvAny().reviver))
        .be.exactly(1);
    });

    it('supports valid values with schema', () => {
      JSON.parse('"test"', ajvAny({ type: 'string' }).reviver)
        .should.be.exactly('test');
    });

    it('rejects invalid values', () => {
      should(() => JSON.parse('1', ajvAny({ type: 'string' }).reviver))
        .throw(/should be string/);
    });
  });

  describe('number', () => {
    it('reports the right type', () => {
      ajvNumber().type.should.be.exactly(Number);
    });

    it('supports missing schema', () => {
      should(JSON.parse('1', ajvNumber().reviver))
        .be.exactly(1);
    });

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', ajvNumber({ minimum: 3 }).reviver))
        .be.exactly(4);
    });

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', ajvNumber({ minimum: 3 }).reviver))
        .throw(/should be >= 3/);
    });
  });

  describe('number: wrapped json-compatible', () => {
    it('reports the right type', () => {
      ajvNumber({}, { wrap: true }).type.should.be.exactly(M.Number);
    });

    it('supports missing schema', () => {
      should(JSON.parse('1', ajvNumber({}, { wrap: true }).reviver).inner())
        .be.exactly(1);
    });

    it('supports valid numbers with schema', () => {
      should(JSON.parse('4', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(4);
    });

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('2', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/);
    });
  });

  describe('number: wrapped non-json-compatible', () => {
    it('supports missing schema', () => {
      should(JSON.parse('"-Infinity"', ajvNumber({}, { wrap: true }).reviver).inner())
        .be.exactly(-Infinity);
    });

    it('supports valid numbers with schema', () => {
      should(JSON.parse('"Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .be.exactly(Infinity);
    });

    it('rejects invalid numbers', () => {
      should(() => JSON.parse('"-Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be >= 3/);

      should(() => JSON.parse('"1"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/);

      should(() => JSON.parse('{"a": 1}', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner())
        .throw(/should be number/);
    });
  });

  describe('string', () => {
    it('reports the right type', () => {
      ajvString().type.should.be.exactly(String);
    });

    it('supports missing schema', () => {
      JSON.parse('"test"', ajvString().reviver)
        .should.be.exactly('test');
    });

    it('supports valid strings with schema', () => {
      JSON.parse('"test"', ajvString({ minLength: 3 }).reviver)
        .should.be.exactly('test');
    });

    it('rejects invalid strings', () => {
      should(() => JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver))
        .throw(/shorter than 3 characters/);
    });
  });

  describe('boolean', () => {
    it('reports the right type', () => {
      ajvBoolean().type.should.be.exactly(Boolean);
    });

    it('supports valid booleans', () => {
      JSON.parse('true', ajvBoolean().reviver)
        .should.be.exactly(true);
    });

    it('rejects invalid booleans', () => {
      should(() => JSON.parse('1', ajvBoolean().reviver))
        .throw(/should be boolean/);
    });
  });

  describe('date', () => {
    it('reports the right type', () => {
      ajvDate().type.should.be.exactly(M.Date);
    });

    it('supports valid dates', () => {
      should(JSON.parse('"1988-04-16T00:00:00.000Z"', ajvDate().reviver).inner().getFullYear())
        .be.exactly(1988);
    });

    it('rejects invalid dates', () => {
      should(() => JSON.parse('"1988-04-16T00:00:00.000"', ajvDate().reviver))
        .throw(/should match format "date-time"/);

      should(() => JSON.parse('"1988-04-16"', ajvDate().reviver))
        .throw(/should match format "date-time"/);
    });
  });

  describe('enum', () => {
    it('reports its full schema', () => {
      const Side = M.Enum.fromArray(['A', 'B']);

      M.getSchema(ajvEnum(Side))
        .should.deepEqual({enum: ['A', 'B']});
    });
  });

  describe('enumMap', () => {
    class Side extends M.Enum {}

    const SideEnum = M.Enum.fromArray(['A', 'B'], Side, 'Side');

    it('reports its full schema', () => {
      const meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber());

      M.getSchema(meta)
        .should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {
              type: 'number'
            }
          }
        });

      const meta2 = ajvEnumMap({}, ajv_(SideEnum), number());

      M.getSchema(meta2)
        .should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {}
          }
        });
    });

    it('reports the right types', () => {
      const meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber());

      meta.type.should.be.exactly(M.EnumMap);
      meta.subtypes[0].type.should.be.exactly(Side);
      meta.subtypes[1].type.should.be.exactly(Number);
    });

    it('supports empty schema', () => {
      should(JSON.parse('{"B": 100}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B()))
        .be.exactly(100);
    });

    it('supports valid enumMaps with schema', () => {
      should(JSON.parse('{"B": 100}', ajvEnumMap({ minProperties: 1 }, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B()))
        .be.exactly(100);
    });

    it('rejects invalid enumMaps', () => {
      should(() => JSON.parse('{"A": 100}', ajvEnumMap({ minProperties: 2 }, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/should NOT have less than 2 properties/);

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/should NOT have more than 2 properties/);

      should(() => JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({ maxProperties: 3 }, ajv_(SideEnum), ajvNumber()).reviver))
        .throw(/Invalid JSON at ""/)
        .and.throw(/should NOT have additional properties/);
    });
  });

  describe('list', () => {
    it('list', () => {
      M.getSchema(ajvList({minItems: 2}, ajvNumber({minimum: 5})))
        .should.deepEqual({
          type: 'array',
          minItems: 2,
          items: {
            type: 'number',
            minimum: 5
          }
        });
    });

    it('reports the right types', () => {
      ajvList({}, ajvString()).type.should.be.exactly(M.List);
      ajvList({}, ajvString()).subtypes[0].type.should.be.exactly(String);
    });

    it('supports empty schema', () => {
      JSON.parse('[2,5]', ajvList({}, ajvNumber()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true);
    });

    it('supports valid lists with schema', () => {
      JSON.parse('[2,5]', ajvList({ maxItems: 3 }, ajvNumber()).reviver)
        .equals(M.List.of(2, 5))
        .should.be.exactly(true);
    });

    it('rejects invalid lists', () => {
      should(() => JSON.parse('[2,5,7,1]', ajvList({ maxItems: 3 }, ajvNumber()).reviver))
        .throw(/should NOT have more than 3 items/);
    });
  });

  describe('tuple', () => {
    it('valid data', () => {
      const metadata = ajvList({}, [ajvString(), ajvNumber()]);

      JSON.parse('["a",5]', metadata.reviver)
        .equals(M.List.of('a', 5))
        .should.be.exactly(true);

      M.getSchema(metadata)
        .should.deepEqual({
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: [
            { type: 'string' },
            { type: 'number' }
          ]
        });
    });

    it('nested modelico object', () => {
      class Animal extends M.Base {
        constructor (props) {
          super(Animal, props);
        }

        static innerTypes () {
          return Object.freeze({
            name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
            dimensions: ajvList(
              { minItems: 3, maxItems: 3 },
              ajvNumber({ minimum: 0, exclusiveMinimum: true })
            )
          })
        }
      }

      const metadata = ajvList({}, [ajvString(), _(Animal)]);

      M.genericsFromJS(M.List, [[ajvString(), _(Animal)]], [
        'a',
        {
          name: 'Bane',
          dimensions: [20, 55, 65]
        }
      ]).equals(
        M.List.of(
          'a',
          new Animal({
            name: 'Bane',
            dimensions: M.List.of(20, 55, 65)
          })
        )
      ).should.be.exactly(true);

      M.getSchema(metadata)
        .should.deepEqual({
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: [
            { type: 'string' },
            {
              type: 'object',
              required: ['dimensions'],
              properties: {
                name: {
                  default: 'unknown',
                  anyOf: [
                    { type: 'null' },
                    {
                      default: 'unknown',
                      type: 'string',
                      minLength: 1,
                      maxLength: 25
                    }
                  ]
                },
                dimensions: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'number',
                    exclusiveMinimum: true,
                    minimum: 0
                  }
                }
              }
            }
          ]
        });
    });

    it('invalid data', () => {
      const metadata = ajvList({}, [ajvString(), ajvNumber()]);

      should(() => JSON.parse('["a",true]', metadata.reviver))
        .throw(/should be number/);

      should(() => JSON.parse('["a"]', metadata.reviver))
        .throw(/should NOT have less than 2 items/);

      should(() => JSON.parse('["a",1,2]', metadata.reviver))
        .throw(/should NOT have more than 2 items/);
    });

    it('maybe', () => {
      M.genericsFromJSON(M.List, [[ajvString(), ajvMaybe(ajvNumber())]], '["a",1]')
        .equals(M.List.of('a', M.Just.of(1)))
        .should.be.exactly(true);

      M.genericsFromJSON(M.List, [[ajvString(), ajvMaybe(ajvNumber())]], '["a",null]')
        .equals(M.List.of('a', M.Nothing))
        .should.be.exactly(true);
    });
  });

  describe('map', () => {
    it('reports its full schema', () => {
      const meta = ajvMap({}, ajvNumber(), ajvString());

      M.getSchema(meta)
        .should.deepEqual({
          type: 'array',
          items: {
            type: 'array',
            maxItems: 2,
            minItems: 2,
            items: [
              { type: 'number' },
              { type: 'string' }
            ]
          }
        });
    });

    it('reports the right types', () => {
      const meta = ajvMap({}, ajvNumber(), ajvString());

      meta.type.should.be.exactly(M.Map);
      meta.subtypes[0].type.should.be.exactly(Number);
      meta.subtypes[1].type.should.be.exactly(String);
    });

    it('supports empty schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({}, ajvNumber(), ajvString()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true);
    });

    it('supports valid maps with schema', () => {
      JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({ minItems: 2 }, ajvNumber(), ajvString()).reviver)
        .equals(M.Map.of(2, 'dos', 5, 'cinco'))
        .should.be.exactly(true);
    });

    it('rejects invalid maps', () => {
      should(() => JSON.parse('[[2, "dos", "extra"]]', ajvMap({}, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have more than 2 items/);

      should(() => JSON.parse('[[2]]', ajvMap({}, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have less than 2 items/);

      should(() => JSON.parse('[[1, "uno"], [2, "dos"], [3, "tres"]]', ajvMap({ minItems: 4 }, ajvNumber(), ajvString()).reviver))
        .throw(/should NOT have less than 4 items/);
    });
  });

  describe('stringMap', () => {
    it('reports its full schema', () => {
      const meta = ajvStringMap({}, ajvNumber());

      M.getSchema(meta)
        .should.deepEqual({
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '.*': {
              type: 'number'
            }
          }
        });
    });

    it('reports the right types', () => {
      const meta = ajvStringMap({}, ajvNumber());

      meta.type.should.be.exactly(M.StringMap);
      meta.subtypes[0].type.should.be.exactly(Number);
    });

    it('supports empty schema', () => {
      should(JSON.parse('{"uno": 1}', ajvStringMap({}, ajvNumber()).reviver).get('uno'))
        .be.exactly(1);
    });

    it('supports valid stringMaps with schema', () => {
      should(JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 1 }, ajvNumber()).reviver).get('uno'))
        .be.exactly(1);
    });

    it('rejects invalid stringMaps', () => {
      should(() => JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 2 }, ajvNumber()).reviver))
        .throw(/should NOT have less than 2 properties/);
    });
  });

  describe('set', () => {
    it('reports its full schema', () => {
      const meta = ajvSet({}, ajvNumber());

      M.getSchema(meta)
        .should.deepEqual({
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'number'
          }
        });
    });

    it('reports the right types', () => {
      ajvSet({}, ajvNumber()).type.should.be.exactly(M.Set);
      ajvSet({}, ajvNumber()).subtypes[0].type.should.be.exactly(Number);
    });

    it('supports empty schema', () => {
      JSON.parse('[2,5]', ajvSet({}, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true);
    });

    it('supports valid sets with schema', () => {
      JSON.parse('[2,5]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true);
    });

    it('rejects invalid sets', () => {
      should(() => JSON.parse('[2,5,7,1]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver))
        .throw(/should NOT have more than 3 items/);
    });

    it('rejects duplicated values by default', () => {
      should(() => JSON.parse('[2,5,5]', ajvSet({}, ajvNumber()).reviver))
        .throw(/should NOT have duplicate items/);
    });

    it('supports duplicates when explicitly told', () => {
      JSON.parse('[2,5,5]', ajvSet({ uniqueItems: false }, ajvNumber()).reviver)
        .equals(M.Set.of(2, 5))
        .should.be.exactly(true);
    });
  });

  describe('maybe', () => {
    it('reports the right types', () => {
      ajvMaybe(ajvString()).type.should.be.exactly(M.Maybe);
      ajvMaybe(ajvString()).subtypes[0].type.should.be.exactly(String);
    });

    it('behaves just as the normal maybe metadata', () => {
      JSON.parse('null', ajvMaybe(ajvString()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('fallback');

      JSON.parse('"Javier"', ajvMaybe(ajvString()).reviver)
        .getOrElse('fallback')
        .should.be.exactly('Javier');
    });
  });

  describe('ajvWithDefault', () => {
    it('should validate the default value', () => {
      class CountryCode extends M.Base {
        constructor (props) {
          super(CountryCode, props);
        }

        static innerTypes () {
          return Object.freeze({
            value: ajvWithDefault(ajvString({minLength: 3, maxLength: 3}), 'SPAIN')
          })
        }
      }

      (() => new CountryCode())
        .should.throw(/should NOT be longer than 3 characters/);
    });
  });

  describe('recipe: validate within the constructor', () => {
    const ajv = Ajv();

    it('should validate the default value', () => {
      class CountryCode extends M.Base {
        constructor (props) {
          if (!ajv.validate(M.getSchema(_(CountryCode)), props)) {
            throw TypeError(ajv.errors.map(error => error.message).join('\n'))
          }

          super(CountryCode, props);
        }

        static innerTypes () {
          return Object.freeze({
            value: ajvWithDefault(ajvString({minLength: 3, maxLength: 3}), 'ESP')
          })
        }
      }

      (() => new CountryCode({value: 'SPAIN'}))
        .should.throw(/should NOT be longer than 3 characters/);

      const australia = new CountryCode({value: 'AUS'});

      should(() => australia.set('value', 'AU'))
        .throw(/should NOT be shorter than 3 characters/);
    });
  });

  describe('recipe: validation at top level', () => {
    class Animal extends M.Base {
      constructor (props) {
        super(Animal, props);
      }

      static innerTypes () {
        return Object.freeze({
          name: ajvString()
        })
      }
    }

    const baseSchema = M.getSchema(base(Animal));

    const enhancedMeta = additionalProperties =>
      ajvBase(
        Animal,
        Object.assign({}, baseSchema, { additionalProperties })
      );

    it('supports additional properties unless otherwise stated', () => {
      should(() => ajvBase(Animal).reviver('', {
        name: 'Bane',
        extra: 1
      })).not.throw();

      should(() => enhancedMeta(true).reviver('', {
        name: 'Bane',
        extra: 1
      })).not.throw();

      M.getSchema(enhancedMeta(true))
        .should.deepEqual({
          type: 'object',
          additionalProperties: true,
          properties: {
            name: {
              type: 'string'
            }
          },
          required: ['name']
        });
    });

    it('supports failing with additional properties', () => {
      should(() => enhancedMeta(false).reviver('', {
        name: 'Bane',
        extra: 1
      })).throw(/should NOT have additional properties/);

      M.getSchema(enhancedMeta(false))
        .should.deepEqual({
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string'
            }
          },
          required: ['name']
        });
    });

    it('should allow basic validation at top level', () => {
      should(() => M.ajvFromJSON(ajv_, Animal, { maxProperties: 2 }, `{
        "name": "Bane",
        "dimensions": [20, 55, 65],
        "extra": 1
      }`))
        .throw(/should NOT have more than 2 properties/);
    });
  });

  describe('withValidation', () => {
    it('facilitates custom validation rules', () => {
      const lowerCaseString = schema => M.withValidation(
        v => v.toLowerCase() === v,
        (v, path) => `string ${v} at "${path.join(' -> ')}" is not all lower case`
      )(ajvString(schema));

      JSON.parse('"abc123"', lowerCaseString({minLength: 5}).reviver)
        .should.be.exactly('abc123');

      should(() => JSON.parse('"abc"', lowerCaseString({minLength: 5}).reviver))
        .throw(/should NOT be shorter than 5 characters/);

      should(() => JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver))
        .throw(/string aBc123 at "" is not all lower case/);
    });

    it('should have a default error message', () => {
      const lowerCaseString = schema => M.withValidation(v => v.toLowerCase() === v)(ajvString(schema));

      should(() => JSON.parse('"aBc123"', lowerCaseString({minLength: 5}).reviver))
        .throw(/Invalid value at ""/);
    });

    it('should work for nested metadata', () => {
      const lowerCaseString = schema => M.withValidation(
        v => v.toLowerCase() === v,
        (v, path) => `string ${v} at "${path.join(' -> ')}" is not all lower case`
      )(ajvString(schema));

      class MagicString extends M.Base {
        constructor (props) {
          super(MagicString, props);
        }

        static innerTypes () {
          return Object.freeze({
            str: lowerCaseString({minLength: 5})
          })
        }
      }

      M.fromJSON(MagicString, '{"str": "abc123"}').str()
        .should.be.exactly('abc123');

      should(() => M.fromJSON(MagicString, '{"str": "abc"}'))
        .throw(/should NOT be shorter than 5 characters/);

      should(() => M.fromJSON(MagicString, '{"str": "aBc123"}'))
        .throw(/string aBc123 at "str" is not all lower case/);

      should(() => JSON.parse(
        '{"str": "abc123", "forceFail": true}',
        M.withValidation(v => M.fields(v).forceFail !== true, () => 'forcibly failed')(_(MagicString)).reviver
      )).throw(/forcibly failed/);
    });
  });

  describe('anyOf', () => {
    class ScoreType extends M.Enum {}
    const ScoreTypeEnum = M.Enum.fromArray(['Numeric', 'Alphabetic'], ScoreType, 'ScoreType');

    class Score extends M.Base {
      constructor (props) {
        super(Score, props);
      }

      static innerTypes () {
        return Object.freeze({
          type: ajvEnum(ScoreTypeEnum),
          score: ajvAnyOf([
            [ajvNumber({minimum: 0}), ScoreTypeEnum.Numeric()],
            [ajvString({minLength: 1}), ScoreTypeEnum.Alphabetic()]
          ])
        })
      }
    }

    it('reports its full schema', () => {
      const expectedSchema = {
        type: 'object',
        properties: {
          type: {
            enum: [
              'Numeric',
              'Alphabetic'
            ]
          },
          score: {
            anyOf: [
              { type: 'number', minimum: 0 },
              { type: 'string', minLength: 1 }
            ]
          }
        },
        required: [
          'type',
          'score'
        ]
      };

      M.getSchema(_(Score))
        .should.deepEqual(expectedSchema);
    });
  });

  describe('Circular innerTypes', () => {
    it('self reference', () => {
      class Chain extends M.createAjvModel(Ajv(), m => ({
        description: m.ajvString({minLength: 1}),
        previous: m.ajvMaybe(m._(Chain)),
        next: m.ajvMaybe(m._(Chain)),
        relatedChains: m.ajvList({}, m._(Chain))
      })) {
        constructor (props) {
          super(Chain, props);
        }
      }

      M.getSchema(_(Chain))
        .should.deepEqual({
          definitions: {
            '1': {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  minLength: 1
                },
                previous: {
                  anyOf: [
                    { type: 'null' },
                    { $ref: '#/definitions/1' }
                  ]
                },
                next: {
                  anyOf: [
                    { type: 'null' },
                    { $ref: '#/definitions/1' }
                  ]
                },
                relatedChains: {
                  type: 'array',
                  items: {
                    '$ref': '#/definitions/1'
                  }
                }
              },
              required: [
                'description',
                'relatedChains'
              ]
            }
          },
          $ref: '#/definitions/1'
        });
    });

    it('indirect reference', () => {
      const nonEmptyString = ajvString({minLength: 1});

      let maybeChildMetadata;
      const maybeChild = () => {
        if (!maybeChildMetadata) {
          maybeChildMetadata = ajvMaybe(_(Child));
        }

        return maybeChildMetadata
      };

      class Parent extends M.Base {
        constructor (props) {
          super(Parent, props);
        }

        static innerTypes () {
          return Object.freeze({
            name: nonEmptyString,
            child: maybeChild()
          })
        }
      }

      class Child extends M.Base {
        constructor (props) {
          super(Parent, props);
        }

        static innerTypes () {
          return Object.freeze({
            name: nonEmptyString,
            parent: _(Parent)
          })
        }
      }

      class Person extends M.Base {
        constructor (props) {
          super(Parent, props);
        }

        static innerTypes () {
          return Object.freeze({
            name: nonEmptyString,
            parent: _(Parent),
            child: maybeChild()
          })
        }
      }

      M.getSchema(_(Person))
        .should.deepEqual({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1
            },
            parent: {
              type: 'object',
              properties: {
                name: {
                  $ref: '#/definitions/2'
                },
                child: {
                  anyOf: [
                    { type: 'null' },
                    {
                      type: 'object',
                      properties: {
                        name: {
                          $ref: '#/definitions/2'
                        },
                        parent: {
                          $ref: '#/definitions/3'
                        }
                      },
                      required: [
                        'name',
                        'parent'
                      ]
                    }
                  ]
                }
              },
              required: [
                'name'
              ]
            },
            child: {
              anyOf: [
                { type: 'null' },
                {
                  $ref: '#/definitions/4'
                }
              ]
            }
          },
          required: [
            'name',
            'parent'
          ],
          definitions: {
            2: {
              type: 'string',
              minLength: 1
            },
            3: {
              type: 'object',
              properties: {
                name: {
                  $ref: '#/definitions/2'
                },
                child: {
                  anyOf: [
                    { type: 'null' },
                    {
                      type: 'object',
                      properties: {
                        name: {
                          $ref: '#/definitions/2'
                        },
                        parent: {
                          $ref: '#/definitions/3'
                        }
                      },
                      required: [
                        'name',
                        'parent'
                      ]
                    }
                  ]
                }
              },
              required: [
                'name'
              ]
            },
            4: {
              type: 'object',
              properties: {
                name: {
                  $ref: '#/definitions/2'
                },
                parent: {
                  $ref: '#/definitions/3'
                }
              },
              required: [
                'name',
                'parent'
              ]
            }
          }
        });
    });
  });
};

/* eslint-env mocha */
var baseMetadataExample = (should, M, fixtures, { Ajv }) => () => {
  const { base, number, ajvAny, ajvNumber } = M.ajvMetadata(Ajv());

  it('should return the base metadata for standard models', () => {
    const customReviver = baseReviver => (k, v, path = []) => {
      if (k !== '') {
        return v
      }

      if (v.min > v.max) {
        throw RangeError('"min" must be less than or equal to "max"')
      }

      return baseReviver(k, v, path)
    };

    class Range extends M.Base {
      constructor ({ min = -Infinity, max = Infinity } = {}) {
        super(Range, { min, max });
      }

      length () {
        return this.max() - this.min()
      }

      static innerTypes () {
        return Object.freeze({
          min: number(),
          max: number()
        })
      }

      static metadata () {
        const baseMetadata = base(Range);
        const baseReviver = baseMetadata.reviver;

        return Object.assign({}, baseMetadata, { reviver: customReviver(baseReviver) })
      }
    }

    M.fromJS(Range, { min: 4, max: 6.5 })
      .length().should.be.exactly(2.5);

    should(() => M.fromJS(Range, { min: 4, max: 3.5 }))
      .throw('"min" must be less than or equal to "max"');

    const validRange = new Range({ min: 0, max: 5 });
    const invalidRange = validRange.set('max', -5);

    M.validate(validRange)[0]
      .should.be.exactly(true);

    const invalidRangeValidationResult = M.validate(invalidRange);

    invalidRangeValidationResult[0]
      .should.be.exactly(false);

    invalidRangeValidationResult[1].message
      .should.be.exactly('"min" must be less than or equal to "max"');

    M.validate(M.List.of(3, 2), [ajvNumber()])[0]
      .should.be.exactly(true);

    const listWithMixedData = M.List.of(3, 'a');

    M.validate(listWithMixedData, [ajvAny()])[0]
      .should.be.exactly(true);

    M.validate(listWithMixedData, [ajvNumber()])[0]
      .should.be.exactly(false);

    M.validate(listWithMixedData, [ajvNumber()])[1].message
      .should.match(/should be number/);
  });
};

/* eslint-env mocha */
/* global requestIdleCallback */

const schedule = (typeof requestIdleCallback !== 'undefined')
  ? requestIdleCallback
  : (typeof setImmediate !== 'undefined')
  ? setImmediate
  : fn => setTimeout(fn, 0);

const asyncMap = (
  fn,
  arr,
  {batchSize = arr.length} = {}
) => arr.reduce((acc, _, i) => {
  if (i % batchSize !== 0) {
    return acc
  }

  return acc.then(result =>
    new Promise(resolve => {
      schedule(() => {
        result.push.apply(result, arr.slice(i, i + batchSize).map(fn));
        resolve(result);
      });
    })
  )
}, Promise.resolve([]));

var asyncReviving = (should, M) => () => {
  it('should revieve data asynchronously', () => {
    class Book extends M.createModel(m => ({
      title: m.string(),
      author: m.string()
    })) {
      constructor (props) {
        super(Book, props);
      }
    }

    class Library extends M.createModel(m => ({
      catalogue: m.list(m._(Book))
    })) {
      constructor (props) {
        super(Library, props);
      }
    }

    const libraryObj = {
      catalogue: [{
        title: 'Madame Bovary: Mœurs de province',
        author: 'Gustave Flaubert'
      }, {
        title: 'La voz a ti debida',
        author: 'Pedro Salinas'
      }, {
        title: 'Et dukkehjem',
        author: 'Henrik Ibsen'
      }, {
        title: 'Die Verwandlung',
        author: 'Franz Kafka'
      }, {
        title: 'La colmena',
        author: 'Camilo José Cela'
      }]
    };

    const emptyLibraryObj = Object.assign({}, libraryObj, {catalogue: []});
    const emptyLibrary = M.fromJS(Library, emptyLibraryObj);

    emptyLibrary.catalogue().size
      .should.be.exactly(0);

    return asyncMap(
      book => M.fromJS(Book, book),
      libraryObj.catalogue,
      { batchSize: 2 }
    )
      .then(catalogueArr => {
        const catalogue = M.List.fromArray(catalogueArr);

        return emptyLibrary.copy({catalogue})
      })
      .then(library => {
        const catalogue = library.catalogue();

        catalogue.size
          .should.be.exactly(5);

        catalogue.get(0).title()
          .should.be.exactly('Madame Bovary: Mœurs de province');

        catalogue.getIn([4, 'title'])
          .should.be.exactly('La colmena');
      })
  });
};

/* eslint-env mocha */

const hasProxies = (() => {
  try {
    return new Proxy({}, {}) && true
  } catch (ignore) {}

  return false
})();

const hasToStringTagSymbol = (() => {
  const a = {};

  a[Symbol.toStringTag] = 'foo';

  return (a + '') === '[object foo]'
})();

const buildUtils = () => Object.freeze({
  skipIfNoProxies: fn => hasProxies ? fn : fn.skip,
  skipIfNoToStringTagSymbol: fn => hasToStringTagSymbol ? fn : fn.skip,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]])
});

var modelicoSpec = ({Should, Modelico: M, extensions}) => () => {
  const U = buildUtils();

  const PartOfDay = partOfDayFactory(M);
  const Sex = sexFactory(M);

  const fixtures = Object.freeze({
    cityFactory,
    countryFactory,
    fixerIoFactory,
    PartOfDay,
    Sex,
    Person: personFactory(M, PartOfDay, Sex),
    Animal: animalFactory(M),
    Friend: friendFactory(M),
    Region: regionFactory(M),
    RegionIncompatibleNameKey: regionIncompatibleNameKeyFactory(M)
  });

  const deps = [Should, M, fixtures, extensions];

  describe('Base', Base(U, ...deps));
  describe('Number', ModelicoNumber(U, ...deps));
  describe('Date', ModelicoDate(U, ...deps));
  describe('Map', ModelicoMap(U, ...deps));
  describe('StringMap', ModelicoStringMap(...deps));
  describe('Enum', ModelicoEnum(...deps));
  describe('EnumMap', ModelicoEnumMap(U, ...deps));
  describe('List', ModelicoList(U, ...deps));
  describe('Set', ModelicoSet(U, ...deps));
  describe('Maybe', ModelicoMaybe(U, ...deps));

  describe('asIs', asIs(U, ...deps));
  describe('setIn', setIn(U, ...deps));
  describe('ajvMetadata', ajvMetadata(...deps));
  describe('base metadata example', baseMetadataExample(...deps));

  describe('Readme simple features', featuresSimple(...deps));
  describe('Readme advanced features', featuresAdvanced(...deps));
  describe('Readme advanced features ES5', featuresAdvancedES5(...deps));
  describe('Deep nesting features', featuresDeepNesting(...deps));
  describe('Reviving polymrphic JSON', featuresPolymorphic(...deps));
  describe('Immutable.js examples', ImmutableExamples(U, ...deps));

  describe('Api Example: Fixer IO', fixerIoSpec(...deps));
  describe('Async reviving', asyncReviving(...deps));

  U.skipIfNoProxies(describe)(
    'Immutable.js examples (proxied)',
    ImmutableProxied(U, ...deps)
  );

  U.skipIfNoProxies(describe)('Proxies', () => {
    describe('Map', proxyMap(...deps));
    describe('List', proxyList(...deps));
    describe('Set', proxySet(...deps));
    describe('Date', proxyDate(...deps));
  });

  describe('Cases', cases(...deps));
};

export default modelicoSpec;
