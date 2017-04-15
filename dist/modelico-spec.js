(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(function() {
		var current = global.modelicoSpec;
		var exports = factory();
		global.modelicoSpec = exports;
		exports.noConflict = function() { global.modelicoSpec = current; return exports; };
	})();
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/* eslint-env mocha */

var Base = (function (U, should, M, fixtures) {
  return function () {
    var Person = fixtures.Person,
        PartOfDay = fixtures.PartOfDay,
        Sex = fixtures.Sex,
        Animal = fixtures.Animal,
        Friend = fixtures.Friend;

    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        number = _M$metadata.number,
        string = _M$metadata.string,
        withDefault = _M$metadata.withDefault;

    var ModelicoDate = M.Date;

    var author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
    var author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

    describe('immutability', function () {
      it('must freeze wrapped input', function () {
        var authorFields = {
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        };

        var author = new Person(authorFields);

        should(function () {
          authorFields.givenName = 'Javi';
        }).throw();

        author.givenName().should.be.exactly('Javier');
      });
    });

    describe('default innerTypes', function () {
      var Country = function (_M$Base) {
        inherits(Country, _M$Base);

        function Country(props) {
          classCallCheck(this, Country);
          return possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, props));
        }

        return Country;
      }(M.Base);

      it('should not throw when static innerTypes are missing', function () {
        (function () {
          return M.fromJSON(Country, '{"code": "ESP"}');
        }).should.not.throw();

        var esp = M.fromJSON(Country, '{"code": "ESP"}');

        should(esp.code).be.exactly(undefined);

        esp.get('code').should.be.exactly('ESP');
      });

      it('allows simple model creation without inner types (discouraged)', function () {
        var Book = function (_M$createModel) {
          inherits(Book, _M$createModel);

          function Book(props) {
            classCallCheck(this, Book);
            return possibleConstructorReturn(this, (Book.__proto__ || Object.getPrototypeOf(Book)).call(this, Book, props));
          }

          return Book;
        }(M.createModel());

        var myBook = new Book();

        JSON.stringify(myBook).should.be.exactly('{}');

        JSON.stringify(myBook.set('title', 'La verdad sobre el caso Savolta')).should.be.exactly('{"title":"La verdad sobre el caso Savolta"}');
      });
    });

    describe('setting', function () {
      it('should not support null (wrap with Maybe)', function () {
        should(function () {
          return M.fromJSON(Person, author2Json);
        }).throw();

        should(function () {
          return new Person(null);
        }).throw();
      });

      it('should set fields returning a new object', function () {
        var author1 = new Person({
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
        JSON.stringify(author1).should.be.exactly(author1Json);

        author1.givenName().should.be.exactly('Javier');

        // field setting
        var author2 = author1.set('givenName', 'Javi');

        // repeat sanity check
        author1.givenName().should.be.exactly('Javier');

        JSON.stringify(author1).should.be.exactly(author1Json);

        // new object checks
        should(author2 === author1).be.exactly(false);
        author2.givenName().should.be.exactly('Javi');
        author2.equals(author1).should.be.exactly(false, 'Oops, they are equal');
      });

      it('should support creating a copy with updated fields', function () {
        var Book = function (_M$createModel2) {
          inherits(Book, _M$createModel2);

          function Book(fields) {
            classCallCheck(this, Book);
            return possibleConstructorReturn(this, (Book.__proto__ || Object.getPrototypeOf(Book)).call(this, Book, fields));
          }

          return Book;
        }(M.createModel(function (_ref) {
          var m = _ref.m;
          return {
            title: m.string(),
            year: m.maybe(m.number()),
            author: m.withDefault(m.string(), 'anonymouss')
          };
        }));

        var book1 = new Book({
          title: 'El Guitarrista',
          year: M.Just.of(2002),
          author: 'Luis Landero'
        });

        var book2 = book1.copy({
          title: 'O Homem Duplicado',
          author: 'José Saramago'
        });

        book1.title().should.be.exactly('El Guitarrista');
        book2.title().should.be.exactly('O Homem Duplicado');

        should(book1.year().getOrElse(2017)).be.exactly(2002);
        should(book2.year().getOrElse(2017)).be.exactly(2002);
      });

      it('should set fields recursively returning a new object', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        });

        var author2 = author1.setIn(['givenName'], 'Javi').setIn(['birthday'], new Date('1989-04-16T00:00:00.000Z'));

        should(author2.birthday().inner().getFullYear()).be.exactly(1989);

        // verify that the original author1 was not mutated
        should(author1.birthday().inner().getFullYear()).be.exactly(1988);
      });

      it('edge case when Modélico setIn is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);
        var listOfPeople1 = M.List.of(author);

        var listOfPeople2 = listOfPeople1.setIn([0, 'givenName'], 'Javi');
        var listOfPeople3 = listOfPeople2.setIn([0], M.fields(author));

        listOfPeople1.get(0).givenName().should.be.exactly('Javier');
        listOfPeople2.get(0).givenName().should.be.exactly('Javi');
        listOfPeople3.get(0).givenName().should.be.exactly('Javier');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new Person({
            givenName: 'Javier',
            familyName: 'Cejudo',
            birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
            favouritePartOfDay: null,
            lifeEvents: M.Map.EMPTY(),
            importantDatesList: M.List.EMPTY(),
            importantDatesSet: M.Set.EMPTY(),
            sex: M.Just.of(Sex.MALE())
          });
        }).should.throw();
      });
    });

    describe('toJS', function () {
      it('should return as primitives or arrays or objects only', function () {
        var author1 = new Person({
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

    describe('fromJS', function () {
      it('should parse from primitives, arrays or objects only', function () {
        var author1 = new Person({
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

    describe('stringifying', function () {
      it('should stringify types correctly', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        });

        JSON.stringify(author1).should.be.exactly(author1Json).and.exactly(author1.stringify());
      });
    });

    describe('parsing', function () {
      it('should parse types correctly', function () {
        var author1 = M.fromJSON(Person, author1Json);
        var author2 = JSON.parse(author1Json, _(Person).reviver);

        'Javier Cejudo'.should.be.exactly(author1.fullName()).and.exactly(author2.fullName());

        should(1988).be.exactly(author1.birthday().inner().getFullYear()).and.exactly(author2.birthday().inner().getFullYear());

        should(PartOfDay.EVENING().minTime).be.exactly(author1.favouritePartOfDay().minTime).and.exactly(author2.favouritePartOfDay().minTime);

        should(Sex.MALE().toJSON()).be.exactly(author1.sex().toJSON()).and.exactly(author2.sex().toJSON());
      });

      it('should work with plain classes extending Modélico', function () {
        var animal = JSON.parse('{"name": "Sam"}', _(Animal).reviver);

        animal.speak().should.be.exactly('hello');
        animal.name().should.be.exactly('Sam');
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: M.Just.of(Sex.MALE()),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY()
        });

        var author2 = new Person({
          familyName: 'Cejudo',
          givenName: 'Javier',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        });

        var author3 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo Goñi',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        });

        var author4 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY()
        });

        var author5 = new Person({
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

    describe('fields', function () {
      it('preserves undeclared properties', function () {
        var authorJson = '{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);

        JSON.stringify(author).should.be.exactly('{"undeclaredField":"something","givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}');
      });
    });

    describe('circular innerTypes', function () {
      it('a Modélico type can have a key that is a Maybe of its own type', function () {
        var bestFriend = new Friend({
          name: 'John',
          bestFriend: M.Nothing
        });

        var marc = new Friend({
          name: 'Marc',
          bestFriend: M.Just.of(bestFriend)
        });

        marc.bestFriend().getOrElse(Friend.EMPTY).name().should.be.exactly('John');
      });
    });

    describe('withDefault', function () {
      it('should allow enhancing metadata to have default values', function () {
        var Book = function (_M$createModel3) {
          inherits(Book, _M$createModel3);

          function Book(props) {
            classCallCheck(this, Book);
            return possibleConstructorReturn(this, (Book.__proto__ || Object.getPrototypeOf(Book)).call(this, Book, props));
          }

          createClass(Book, [{
            key: 'getTitleBy',
            value: function getTitleBy() {
              return '"' + this.title() + '" by ' + this.author();
            }
          }], [{
            key: 'innerTypes',
            value: function innerTypes() {
              return get(Book.__proto__ || Object.getPrototypeOf(Book), 'innerTypes', this).call(this);
            }
          }]);
          return Book;
        }(M.createModel({
          title: string(),
          author: withDefault(string(), 'anonymous')
        }, { stringTag: 'Book' }));

        var lazarillo1 = M.fromJS(Book, {
          title: 'Lazarillo de Tormes'
        });

        lazarillo1.getTitleBy().should.be.exactly('"Lazarillo de Tormes" by anonymous');

        var lazarillo2 = new Book({
          title: 'Lazarillo de Tormes'
        });

        lazarillo2.getTitleBy().should.be.exactly('"Lazarillo de Tormes" by anonymous');
      });
    });

    describe('withDefault', function () {
      it('should use the metadata to coerce the value if necessary', function () {
        var CountryCallingCode = function (_M$createModel4) {
          inherits(CountryCallingCode, _M$createModel4);

          function CountryCallingCode(props) {
            classCallCheck(this, CountryCallingCode);
            return possibleConstructorReturn(this, (CountryCallingCode.__proto__ || Object.getPrototypeOf(CountryCallingCode)).call(this, CountryCallingCode, props));
          }

          createClass(CountryCallingCode, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return get(CountryCallingCode.__proto__ || Object.getPrototypeOf(CountryCallingCode), 'innerTypes', this).call(this);
            }
          }]);
          return CountryCallingCode;
        }(M.createModel(function () {
          return {
            code: withDefault(number(), '34')
          };
        }));

        var spain = M.fromJS(CountryCallingCode, {});

        spain.code().should.be.exactly(34);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should use the metadata to coerce the value if necessary', function () {
        var CountryCallingCode = function (_M$createModel5) {
          inherits(CountryCallingCode, _M$createModel5);

          function CountryCallingCode(props) {
            classCallCheck(this, CountryCallingCode);
            return possibleConstructorReturn(this, (CountryCallingCode.__proto__ || Object.getPrototypeOf(CountryCallingCode)).call(this, CountryCallingCode, props));
          }

          createClass(CountryCallingCode, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return get(CountryCallingCode.__proto__ || Object.getPrototypeOf(CountryCallingCode), 'innerTypes', this).call(this);
            }
          }]);
          return CountryCallingCode;
        }(M.createModel(function () {
          return {
            code: withDefault(number(), '34')
          };
        }));

        var spain = M.fromJS(CountryCallingCode, {});

        Object.prototype.toString.call(spain).should.be.exactly('[object ModelicoModel]');
      });

      it('should implement Symbol.toStringTag', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY(),
          importantDatesList: M.List.EMPTY(),
          importantDatesSet: M.Set.EMPTY(),
          sex: M.Just.of(Sex.MALE())
        });

        Object.prototype.toString.call(author1).should.be.exactly('[object ModelicoModel]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoNumber = (function (U, should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        number = _M$metadata.number;

    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.Number(5);
        }).should.throw();
      });

      it('should cast using Number', function () {
        should(new M.Number().inner()).be.exactly(0);
        should(new M.Number(2).inner()).be.exactly(2);
        should(new M.Number('2').inner()).be.exactly(2);
        should(new M.Number('-Infinity').inner()).be.exactly(-Infinity);
      });
    });

    describe('setting', function () {
      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return M.Number.of(null);
        }).should.throw();
      });

      it('should set numbers correctly', function () {
        var numberA = M.Number.of(2);
        var numberB = numberA.setIn([], 5);

        should(numberA.inner()).be.exactly(2);

        should(numberB.inner()).be.exactly(5);
      });

      it('should not support the set operation', function () {
        var myNumber = M.Number.of(55);

        (function () {
          return myNumber.set();
        }).should.throw();
      });

      it('should not support the setIn operation with non-empty paths', function () {
        var myNumber = M.Number.of(5);

        (function () {
          return myNumber.setIn([0], 7);
        }).should.throw();
      });
    });

    describe('stringifying', function () {
      it('should stringify values correctly', function () {
        var myNumber = M.Number.of(21);

        JSON.stringify(myNumber).should.be.exactly('21');
      });

      it('should support -0', function () {
        var myNumber = M.Number.of(-0);

        JSON.stringify(myNumber).should.be.exactly('"-0"');
      });

      it('should support Infinity', function () {
        var myNumber = M.Number.of(Infinity);

        JSON.stringify(myNumber).should.be.exactly('"Infinity"');
      });

      it('should support -Infinity', function () {
        var myNumber = M.Number.of(-Infinity);

        JSON.stringify(myNumber).should.be.exactly('"-Infinity"');
      });

      it('should support NaN', function () {
        var myNumber = M.Number.of(NaN);

        JSON.stringify(myNumber).should.be.exactly('"NaN"');
      });
    });

    describe('parsing', function () {
      it('should parse values correctly', function () {
        var myNumber = JSON.parse('2', number({ wrap: true }).reviver);

        should(myNumber.inner()).be.exactly(2);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', number({ wrap: true }).reviver);
        }).should.throw();
      });

      it('should support -0', function () {
        var myNumber = JSON.parse('"-0"', number({ wrap: true }).reviver);

        Object.is(myNumber.inner(), -0).should.be.exactly(true);
      });

      it('should support Infinity', function () {
        var myNumber = JSON.parse('"Infinity"', number({ wrap: true }).reviver);

        Object.is(myNumber.inner(), Infinity).should.be.exactly(true);
      });

      it('should support -Infinity', function () {
        var myNumber = JSON.parse('"-Infinity"', number({ wrap: true }).reviver);

        Object.is(myNumber.inner(), -Infinity).should.be.exactly(true);
      });

      it('should support NaN', function () {
        var myNumber = JSON.parse('"NaN"', number({ wrap: true }).reviver);

        Object.is(myNumber.inner(), NaN).should.be.exactly(true);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoNumber1 = M.Number.of(2);
        var modelicoNumber2 = M.Number.of(2);

        modelicoNumber1.should.not.be.exactly(modelicoNumber2);
        modelicoNumber1.should.not.equal(modelicoNumber2);

        modelicoNumber1.equals(modelicoNumber1).should.be.exactly(true);
        modelicoNumber1.equals(modelicoNumber2).should.be.exactly(true);
        modelicoNumber1.equals(2).should.be.exactly(false);
      });

      it('should have same-value-zero semantics', function () {
        M.Number.of(0).equals(M.Number.of(-0)).should.be.exactly(true);
        M.Number.of(NaN).equals(M.Number.of(NaN)).should.be.exactly(true);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.Number.of(1)).should.be.exactly('[object ModelicoNumber]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoDate = (function (U, should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        date = _M$metadata.date;

    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Date('1988-04-16T00:00:00.000Z');
        var myDate = M.Date.of(input);

        input.setFullYear(2017);

        should(myDate.inner().getFullYear()).be.exactly(1988);
      });
    });

    describe('instantiation', function () {
      it('uses the current date by default', function () {
        var mDate = new M.Date();
        var nativeDate = new Date();

        should(mDate.inner().getFullYear()).be.exactly(nativeDate.getFullYear());

        should(mDate.inner().getMonth()).be.exactly(nativeDate.getMonth());

        should(mDate.inner().getDate()).be.exactly(nativeDate.getDate());
      });

      it('must be instantiated with new', function () {
        (function () {
          return M.Date();
        }).should.throw();
      });
    });

    describe('setting', function () {
      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return M.Date.of(null);
        }).should.throw();
      });

      it('should set dates correctly', function () {
        var date1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));
        var date2 = date1.setIn([], new Date('1989-04-16T00:00:00.000Z'));

        should(date2.inner().getFullYear()).be.exactly(1989);

        should(date1.inner().getFullYear()).be.exactly(1988);
      });

      it('should not support the set operation', function () {
        var myDate = M.Date.of(new Date());

        (function () {
          return myDate.set();
        }).should.throw();
      });

      it('should not support the setIn operation with non-empty paths', function () {
        var myDate = M.Date.of(new Date());

        (function () {
          return myDate.setIn([0], new Date());
        }).should.throw();
      });
    });

    describe('stringifying', function () {
      it('should stringify values correctly', function () {
        var myDate = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));

        JSON.stringify(myDate).should.be.exactly('"1988-04-16T00:00:00.000Z"');
      });
    });

    describe('parsing', function () {
      it('should parse Maybe values correctly', function () {
        var myDate = JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver);

        should(myDate.inner().getFullYear()).be.exactly(1988);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', date().reviver);
        }).should.throw();
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoDate1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));
        var modelicoDate2 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'));

        modelicoDate1.should.not.be.exactly(modelicoDate2);
        modelicoDate1.should.not.equal(modelicoDate2);

        modelicoDate1.equals(modelicoDate1).should.be.exactly(true);
        modelicoDate1.equals(modelicoDate2).should.be.exactly(true);
        modelicoDate1.equals('abc').should.be.exactly(false);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.Date.of()).should.be.exactly('[object ModelicoDate]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoMap = (function (U, should, M, _ref) {
  var Person = _ref.Person;
  return function () {
    var _M$metadata = M.metadata(),
        date = _M$metadata.date,
        map = _M$metadata.map,
        number = _M$metadata.number,
        string = _M$metadata.string;

    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Map([['A', 'Good morning!'], ['B', 'Good afternoon!'], ['C', 'Good evening!']]);

        var map = M.Map.fromMap(input);

        input.set('A', "g'day!");

        map.get('A').should.be.exactly('Good morning!');
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var map = M.Map.fromObject({ a: 1, b: 2, c: 3 });

        [].concat(toConsumableArray(map)).should.eql([['a', 1], ['b', 2], ['c', 3]]);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new M.Map(null);
        }).should.throw();
      });

      it('should set fields returning a new map', function () {
        var map = new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], ['b', M.Date.of(new Date())]]);

        var modelicoMap1 = M.Map.fromMap(map);
        var modelicoMap2 = modelicoMap1.set('a', M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.inner().get('a').inner().getFullYear()).be.exactly(1989);

        // verify that modelicoMap1 was not mutated
        should(modelicoMap1.inner().get('a').inner().getFullYear()).be.exactly(1988);
      });

      it('should set fields returning a new map when part of a path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
        var author1 = M.fromJSON(Person, authorJson);
        var author2 = author1.setIn(['lifeEvents', 'wedding'], new Date('2010-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2010);

        // verify that author1 was not mutated
        should(author1.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });

      it('edge case when setIn is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
        var author = M.fromJSON(Person, authorJson);

        var map = author.lifeEvents();

        should(map.inner().get('wedding').inner().getFullYear()).be.exactly(2013);

        var customMap = new Map([['wedding', M.Date.of(new Date('2010-03-28T00:00:00.000Z'))]]);

        var map2 = map.setIn([], customMap);

        should(map2.inner().get('wedding').inner().getFullYear()).be.exactly(2010);
      });
    });

    describe('stringifying', function () {
      it('should stringify the map correctly', function () {
        var map = new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]]);

        var modelicoMap = M.Map.fromMap(map);

        JSON.stringify(modelicoMap).should.be.exactly('[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]');
      });
    });

    describe('parsing', function () {
      it('should parse the map correctly', function () {
        var modelicoMap = JSON.parse('[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]', map(string(), date()).reviver);

        var modelicoMapAlt = JSON.parse('[["a","1988-04-16T00:00:00.000Z"],["b","2012-12-25T00:00:00.000Z"]]', map(function () {
          return string();
        }, function () {
          return date();
        }).reviver);

        modelicoMap.equals(modelicoMapAlt).should.be.exactly(true);

        should(modelicoMap.inner().get('a').inner().getFullYear()).be.exactly(1988);

        should(modelicoMap.inner().get('b').inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
        var author = M.fromJSON(Person, authorJson);

        should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });

      it('should be able to work with M.genericsFromJSON', function () {
        var myMap = M.genericsFromJSON(M.Map, [number(), string()], '[[1, "10"], [2, "20"], [3, "30"]]');

        myMap.inner().get(2).should.be.exactly('20');
      });

      it('should be able to work with M.genericsFromJS', function () {
        var myMap = M.genericsFromJS(M.Map, [number(), string()], [[1, '10'], [2, '20'], [3, '30']]);

        myMap.inner().get(2).should.be.exactly('20');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', map(string(), date()).reviver);
        }).should.throw();
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMap = M.Map.fromMap(new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]]));

        var modelicoMap2 = M.Map.fromMap(new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap).should.be.exactly(true);
        modelicoMap.equals(modelicoMap2).should.be.exactly(true);

        modelicoMap.equals(2).should.be.exactly(false);
        M.Map.EMPTY().equals(modelicoMap).should.be.exactly(false);
      });

      it('should have same-value-zero semantics', function () {
        M.Map.of('a', 0).equals(M.Map.of('a', -0)).should.be.exactly(true);
        M.Map.of('a', NaN).equals(M.Map.of('a', NaN)).should.be.exactly(true);

        M.Map.of(-0, 33).equals(M.Map.of(0, 33)).should.be.exactly(true);
      });

      it('should support simple unordered checks', function () {
        M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1)).should.be.exactly(false);

        M.Map.of('a', 1, 'b', 2).equals(M.Map.of('b', 2, 'a', 1), true).should.be.exactly(true);

        M.Map.of('a', 1, 'b', 2, 'c', undefined).equals(M.Map.of('b', 2, 'a', 1, 'd', 4), true).should.be.exactly(false);
      });
    });

    describe('EMPTY / of / fromArray / fromObject / fromMap', function () {
      it('should have a static property for the empty map', function () {
        should(M.Map.EMPTY().inner().size).be.exactly(0);

        M.Map.EMPTY().toJSON().should.eql([]);

        new M.Map().should.be.exactly(M.Map.EMPTY());
      });

      it('should be able to create a map from an even number of params', function () {
        var map = M.Map.of('a', 1, 'b', 2, 'c', 3);

        should(map.inner().get('b')).be.exactly(2);

        (function () {
          return M.Map.of('a', 1, 'b', 2, 'c', 3, 'd');
        }).should.throw();
      });

      it('should be able to create a map from an array', function () {
        var map = M.Map.fromArray([['a', 1], ['b', 2], ['c', 3]]);

        should(map.inner().get('b')).be.exactly(2);
      });

      it('should be able to create a map from an object', function () {
        var map = M.Map.fromObject({ a: 1, b: 2, c: 3 });

        should(map.inner().get('b')).be.exactly(2);
      });

      it('should be able to create a map from a native map', function () {
        var map = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

        should(map.inner().get('b')).be.exactly(2);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.Map.of()).should.be.exactly('[object ModelicoMap]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoStringMap = (function (should, M, _ref) {
  var Person = _ref.Person;
  return function () {
    var _M$metadata = M.metadata(),
        date = _M$metadata.date,
        number = _M$metadata.number,
        stringMap = _M$metadata.stringMap;

    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Map([['A', 'Good morning!'], ['B', 'Good afternoon!'], ['C', 'Good evening!']]);

        var map = M.StringMap.fromMap(input);

        input.set('A', "g'day!");

        map.inner().get('A').should.be.exactly('Good morning!');
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var map = M.StringMap.fromObject({ a: 1, b: 2, c: 3 });

        map.toJSON().should.eql({ a: 1, b: 2, c: 3 });
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new M.StringMap(null);
        }).should.throw();
      });

      it('should set fields returning a new map', function () {
        var map = new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], ['b', M.Date.of(new Date())]]);

        var modelicoMap1 = M.StringMap.fromMap(map);
        var modelicoMap2 = modelicoMap1.set('a', M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.inner().get('a').inner().getFullYear()).be.exactly(1989);

        // verify that modelicoMap1 was not mutated
        should(modelicoMap1.inner().get('a').inner().getFullYear()).be.exactly(1988);
      });
    });

    describe('stringifying', function () {
      it('should stringify the map correctly', function () {
        var map = new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], ['b', M.Date.of(new Date('2012-12-25T00:00:00.000Z'))]]);

        var modelicoMap = M.StringMap.fromMap(map);

        JSON.stringify(modelicoMap).should.be.exactly('{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}');
      });
    });

    describe('parsing', function () {
      it('should parse the map correctly', function () {
        var modelicoMap = JSON.parse('{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}', stringMap(date()).reviver);

        var modelicoMapAlt = JSON.parse('{"a":"1988-04-16T00:00:00.000Z","b":"2012-12-25T00:00:00.000Z"}', stringMap(function () {
          return date();
        }).reviver);

        modelicoMap.equals(modelicoMapAlt).should.be.exactly(true);

        should(modelicoMap.inner().get('a').inner().getFullYear()).be.exactly(1988);

        should(modelicoMap.inner().get('b').inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
        var author = M.fromJSON(Person, authorJson);

        should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });

      it('should be able to work with M.genericsFromJSON', function () {
        var myMap = M.genericsFromJSON(M.StringMap, [number()], '{"1":10,"2":20,"3":30}');

        should(myMap.inner().get('2')).be.exactly(20);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', stringMap(date()).reviver);
        }).should.throw();
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMap = M.StringMap.fromMap(new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]]));

        var modelicoMap2 = M.StringMap.fromMap(new Map([['a', M.Date.of(new Date('1988-04-16T00:00:00.000Z'))]]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap).should.be.exactly(true);
        modelicoMap.equals(modelicoMap2).should.be.exactly(true);

        modelicoMap.equals(2).should.be.exactly(false);
        M.StringMap.EMPTY().equals(modelicoMap).should.be.exactly(false);
      });

      it('should have same-value-zero semantics', function () {
        M.StringMap.of('a', 0).equals(M.StringMap.of('a', -0)).should.be.exactly(true);
        M.StringMap.of('a', NaN).equals(M.StringMap.of('a', NaN)).should.be.exactly(true);
      });
    });

    describe('EMPTY / of / fromArray / fromObject / fromMap', function () {
      it('should have a static property for the empty map', function () {
        should(M.StringMap.EMPTY().inner().size).be.exactly(0);

        M.StringMap.EMPTY().toJSON().should.eql({});
      });

      it('should be able to create a map from an even number of params', function () {
        var map = M.StringMap.of('a', 1, 'b', 2, 'c', 3);

        should(map.inner().get('b')).be.exactly(2);

        (function () {
          return M.StringMap.of('a', 1, 'b', 2, 'c', 3, 'd');
        }).should.throw();
      });

      it('should be able to create a map from an array', function () {
        var map = M.StringMap.fromArray([['a', 1], ['b', 2], ['c', 3]]);

        should(map.inner().get('b')).be.exactly(2);
      });

      it('should be able to create a map from an object', function () {
        var map = M.StringMap.fromObject({ a: 1, b: 2, c: 3 });

        should(map.inner().get('b')).be.exactly(2);
      });

      it('should be able to create a map from a native map', function () {
        var map = M.StringMap.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

        should(map.inner().get('b')).be.exactly(2);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoEnum = (function (should, M, _ref) {
  var PartOfDay = _ref.PartOfDay;
  return function () {
    describe('keys', function () {
      it('only enumerates the enumerators', function () {
        Object.keys(PartOfDay).should.eql(['ANY', 'MORNING', 'AFTERNOON', 'EVENING']);
      });
    });

    describe('equals', function () {
      it('should identify equal instances', function () {
        should(PartOfDay.MORNING() === PartOfDay.MORNING()).be.exactly(true);

        PartOfDay.MORNING().equals(PartOfDay.MORNING()).should.be.exactly(true);

        PartOfDay.MORNING().equals(PartOfDay.EVENING()).should.be.exactly(false);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoEnumMap = (function (U, should, M, _ref) {
  var PartOfDay = _ref.PartOfDay;
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        any = _M$metadata.any,
        anyOf = _M$metadata.anyOf,
        enumMap = _M$metadata.enumMap,
        string = _M$metadata.string;

    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Map([[PartOfDay.MORNING(), 'Good morning!'], [PartOfDay.AFTERNOON(), 'Good afternoon!'], [PartOfDay.EVENING(), 'Good evening!']]);

        var enumMap = M.EnumMap.fromMap(input);

        input.set(PartOfDay.MORNING(), "g'day!");

        enumMap.inner().get(PartOfDay.MORNING()).should.be.exactly('Good morning!');
      });
    });

    describe('setting', function () {
      it('should set fields returning a new enum map', function () {
        var greetings1 = M.EnumMap.of(PartOfDay.MORNING(), 'Good morning!', PartOfDay.AFTERNOON(), 'Good afternoon!', PartOfDay.EVENING(), 'Good evening!');

        var greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

        greetings2.inner().get(PartOfDay.AFTERNOON()).should.be.exactly('GOOD AFTERNOON!');

        greetings1.inner().get(PartOfDay.AFTERNOON()).should.be.exactly('Good afternoon!');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new M.EnumMap(null);
        }).should.throw();
      });

      it('should set fields returning a new enum map when part of a path', function () {
        var map = new Map([[PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), M.Date.of(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]]);

        var greetings1 = M.EnumMap.fromMap(map);
        var greetings2 = greetings1.setIn([PartOfDay.EVENING()], new Date('2013-04-16T00:00:00.000Z'));

        should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2013);

        should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when setIn is called with an empty path', function () {
        var map1 = new Map([[PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), M.Date.of(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]]);

        var map2 = new Map([[PartOfDay.MORNING(), M.Date.of(new Date('1989-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), M.Date.of(new Date('2001-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), M.Date.of(new Date('2013-04-16T00:00:00.000Z'))]]);

        var greetings1 = M.EnumMap.fromMap(map1);
        var greetings2 = greetings1.setIn([], map2);

        should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2013);

        should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2012);
      });
    });

    describe('stringifying', function () {
      it('should stringify the enum map correctly', function () {
        var map = new Map([[PartOfDay.MORNING(), 'Good morning!'], [PartOfDay.AFTERNOON(), 'Good afternoon!'], [PartOfDay.EVENING(), 'Good evening!']]);

        var greetings = M.EnumMap.fromMap(map);

        JSON.stringify(greetings).should.be.exactly('{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}');
      });
    });

    describe('parsing', function () {
      it('should parse the enum map correctly', function () {
        var greetings = JSON.parse('{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}', enumMap(_(PartOfDay), any()).reviver);

        var greetingsAlt = JSON.parse('{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":true}', enumMap(function () {
          return _(PartOfDay);
        }, anyOf()).reviver);

        greetings.equals(greetingsAlt).should.be.exactly(true);

        greetings.inner().get(PartOfDay.MORNING()).should.be.exactly('Good morning!');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', enumMap(_(PartOfDay), string()).reviver);
        }).should.throw();
      });
    });

    describe('EMPTY / of / fromArray / fromMap', function () {
      it('should have a static property for the empty map', function () {
        should(M.EnumMap.EMPTY().inner().size).be.exactly(0);

        M.EnumMap.EMPTY().toJSON().should.eql({});

        new M.EnumMap().should.be.exactly(M.EnumMap.EMPTY());
      });

      it('should be able to create an enum map from an even number of params', function () {
        var map = M.EnumMap.of(PartOfDay.MORNING(), 1, PartOfDay.AFTERNOON(), 2, PartOfDay.EVENING(), 3);

        should(map.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);

        (function () {
          return M.EnumMap.of(PartOfDay.MORNING(), 1, PartOfDay.AFTERNOON());
        }).should.throw();
      });

      it('should be able to create an enum map from an array', function () {
        var enumMap = M.EnumMap.fromArray([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]]);

        should(enumMap.inner().get(PartOfDay.MORNING())).be.exactly(1);
      });

      it('should be able to create an enum map from a native map', function () {
        var enumMap = M.EnumMap.fromMap(new Map([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]]));

        should(enumMap.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.EnumMap.of()).should.be.exactly('[object ModelicoEnumMap]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoList = (function (U, should, M, _ref) {
  var Person = _ref.Person;
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        list = _M$metadata.list,
        date = _M$metadata.date,
        string = _M$metadata.string,
        number = _M$metadata.number,
        maybe = _M$metadata.maybe;

    describe('immutability', function () {
      it('must freeze the input', function () {
        var input = ['a', 'b', 'c'];

        M.List.fromArray(input);(function () {
          input[1] = 'B';
        }).should.throw();
      });
    });

    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.List();
        }).should.throw();
      });
    });

    describe('get', function () {
      it('should return the nth item', function () {
        M.List.of('a', 'b', 'c').get(1).should.be.exactly('b');
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var list = M.List.fromArray([1, 2, 3, 4]);

        Array.from(list).should.eql([1, 2, 3, 4]);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new M.List(null);
        }).should.throw();
      });

      it('should set items in the list correctly', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date())];

        var modelicoList1 = M.List.fromArray(list);
        var modelicoList2 = modelicoList1.set(0, M.Date.of(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoList2.get(0).inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.get(0).inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date())];

        var modelicoList1 = M.List.fromArray(list);
        var modelicoList2 = modelicoList1.setIn([0], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.get(0).inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.get(0).inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path with a single element', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date())];

        var modelicoList1 = M.List.fromArray(list);
        var modelicoList2 = modelicoList1.setIn([0], new Date('2000-04-16T00:00:00.000Z'));

        should(modelicoList2.get(0).inner().getFullYear()).be.exactly(2000);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.get(0).inner().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole list', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author1 = JSON.parse(authorJson, _(Person).reviver);

        var newListArray = [].concat(toConsumableArray(author1.importantDatesList()));
        newListArray.splice(1, 0, M.Date.of(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesList', M.List.fromArray(newListArray));

        should(author1.importantDatesList().size).be.exactly(2);
        should(author1.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
        should(author1.importantDatesList().get(1).inner().getFullYear()).be.exactly(2012);

        should([].concat(toConsumableArray(author2.importantDatesList())).length).be.exactly(3);
        should(author2.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
        should(author2.importantDatesList().get(1).inner().getFullYear()).be.exactly(2016);
        should(author2.importantDatesList().get(2).inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when List setIn is called with an empty path', function () {
        var modelicoDatesList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date()));

        var modelicoDatesList2 = [M.Date.of(new Date('2016-04-16T00:00:00.000Z'))];

        var listOfListOfDates1 = M.List.of(modelicoDatesList1);
        var listOfListOfDates2 = listOfListOfDates1.setIn([0], modelicoDatesList2);

        should(listOfListOfDates1.get(0).get(0).inner().getFullYear()).be.exactly(1988);

        should(listOfListOfDates2.get(0).get(0).inner().getFullYear()).be.exactly(2016);
      });
    });

    describe('stringifying', function () {
      it('should stringify the list correctly', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date('2012-12-25T00:00:00.000Z'))];

        var modelicoList = M.List.fromArray(list);

        JSON.stringify(modelicoList).should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]');
      });
    });

    describe('parsing', function () {
      it('should parse the list correctly', function () {
        var modelicoList = JSON.parse('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]', list(date()).reviver);

        should(modelicoList.get(0).inner().getFullYear()).be.exactly(1988);

        should(modelicoList.get(1).inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);

        should(author.importantDatesList().get(0).inner().getFullYear()).be.exactly(2013);
      });

      it('should not support null (wrap with Maybe)', function () {
        should(function () {
          return JSON.parse('null', list(date()).reviver);
        }).throw('missing list');

        should(function () {
          return M.genericsFromJS(M.List, [date()], [null]);
        }).throw(/missing date/);

        should(function () {
          return M.genericsFromJS(M.List, [string()], [null]);
        }).throw(/expected a value but got nothing \(null, undefined or NaN\)/);

        should(function () {
          return M.genericsFromJS(M.List, [string()], [undefined]);
        }).throw(/expected a value but got nothing \(null, undefined or NaN\)/);

        should(function () {
          return M.genericsFromJS(M.List, [string()], [NaN]);
        }).throw(/expected a value but got nothing \(null, undefined or NaN\)/);
      });
    });

    describe('tuples', function () {
      it('should support tuples', function () {
        M.genericsFromJS(M.List, [[string(), date()]], ['a', new Date('1988-04-16T00:00:00.000Z')]).equals(M.List.of('a', M.Date.of(new Date('1988-04-16T00:00:00.000Z')))).should.be.exactly(true);
      });

      it('should require all values', function () {
        should(function () {
          return M.genericsFromJS(M.List, [[string(), number()]], ['a']);
        }).throw(/tuple has missing or extra items/);

        should(function () {
          return M.genericsFromJS(M.List, [[string(), number()]], []);
        }).throw(/tuple has missing or extra items/);
      });

      it('should not support null (wrap with Maybe)', function () {
        should(function () {
          return M.genericsFromJS(M.List, [[string(), number()]], [undefined, NaN]);
        }).throw(/expected a value but got nothing \(null, undefined or NaN\)/);
      });

      it('should support missing maybes', function () {
        should(function () {
          return M.genericsFromJS(M.List, [[maybe(string()), maybe(number())]], [undefined, NaN]);
        }).not.throw();
      });
    });

    describe('metadata-returning function', function () {
      it('should parse the list correctly', function () {
        var modelicoList = JSON.parse('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]', list(function () {
          return date();
        }).reviver);

        should(modelicoList.get(0).inner().getFullYear()).be.exactly(1988);

        should(modelicoList.get(1).inner().getMonth()).be.exactly(11);
      });

      it('should support tuples', function () {
        M.genericsFromJS(M.List, [[function () {
          return string();
        }, function () {
          return date();
        }]], ['a', new Date('1988-04-16T00:00:00.000Z')]).equals(M.List.of('a', M.Date.of(new Date('1988-04-16T00:00:00.000Z')))).should.be.exactly(true);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoList1 = M.List.of(1, 2, 3);
        var modelicoList2 = M.List.of(1, 2, 3);

        modelicoList1.should.not.be.exactly(modelicoList2);
        modelicoList1.should.not.equal(modelicoList2);

        modelicoList1.equals(modelicoList1).should.be.exactly(true);
        modelicoList1.equals(modelicoList2).should.be.exactly(true);

        modelicoList1.equals(function () {
          return 1;
        }).should.be.exactly(false);
        M.List.EMPTY().equals(modelicoList1).should.be.exactly(false);
      });

      it('should support non-primitive types', function () {
        var modelicoList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));
        var modelicoList2 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

        modelicoList1.should.not.be.exactly(modelicoList2);
        modelicoList1.should.not.equal(modelicoList2);

        modelicoList1.equals(modelicoList1).should.be.exactly(true);
        modelicoList1.equals(modelicoList2).should.be.exactly(true);

        M.List.of(2, 4).equals(M.Set.of(2, 4)).should.be.exactly(false);
        M.List.of(2, 4).equals(M.List.of(4, 2)).should.be.exactly(false);
      });

      it('should have same-value-zero semantics', function () {
        M.List.of(0).equals(M.List.of(-0)).should.be.exactly(true);
        M.List.of(NaN).equals(M.List.of(NaN)).should.be.exactly(true);
      });
    });

    describe('EMPTY / of / fromArray', function () {
      it('should have a static property for the empty list', function () {
        should([].concat(toConsumableArray(M.List.EMPTY())).length).be.exactly(0);

        M.List.EMPTY().toJSON().should.eql([]);

        new M.List().should.be.exactly(M.List.EMPTY());
      });

      it('should be able to create a list from arbitrary parameters', function () {
        var modelicoList = M.List.of(0, 1, 1, 2, 3, 5, 8);

        Array.from(modelicoList).should.eql([0, 1, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a list from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoList = M.List.fromArray(fibArray);

        Array.from(modelicoList).should.eql([0, 1, 1, 2, 3, 5, 8]);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.List.of()).should.be.exactly('[object ModelicoList]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoSet = (function (U, should, M, _ref) {
  var Person = _ref.Person;
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        date = _M$metadata.date,
        set$$1 = _M$metadata.set;

    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Set(['a', 'b', 'c']);
        var set$$1 = M.Set.fromSet(input);

        input.delete('a');

        set$$1.has('a').should.be.exactly(true);
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var set$$1 = M.Set.fromArray([1, 2, 2, 4]);

        [].concat(toConsumableArray(set$$1)).should.eql([1, 2, 4]);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', set$$1(date()).reviver);
        }).should.throw();
      });

      it('should be able to set a whole set', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
        var author1 = JSON.parse(authorJson, _(Person).reviver);

        var date = M.Date.of(new Date('2016-05-03T00:00:00.000Z'));

        var author2 = author1.set('importantDatesSet', M.Set.of(date));

        var author1InnerSet = author1.importantDatesSet().inner();

        should(author1InnerSet.size).be.exactly(2);

        var author2InnerSet = author2.importantDatesSet().inner();

        should(author2InnerSet.size).be.exactly(1);
        author2InnerSet.has(date).should.be.exactly(true);
      });

      it('edge case when Set setIn is called with an empty path', function () {
        var modelicoDatesSet1 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date()));

        var modelicoDatesSet2 = new Set([M.Date.of(new Date('2016-04-16T00:00:00.000Z'))]);

        var listOfSetsOfDates1 = M.List.of(modelicoDatesSet1);
        var listOfSetsOfDates2 = listOfSetsOfDates1.setIn([0], modelicoDatesSet2);

        should([].concat(toConsumableArray([].concat(toConsumableArray(listOfSetsOfDates1))[0]))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray([].concat(toConsumableArray(listOfSetsOfDates2))[0]))[0].inner().getFullYear()).be.exactly(2016);
      });

      it('should not support the set operation', function () {
        var mySet = M.Set.of(1, 2);

        (function () {
          return mySet.set(0, 3);
        }).should.throw();
      });

      it('should not support the setIn operation with non-empty paths', function () {
        var mySet = M.Set.of(1, 2);

        (function () {
          return mySet.setIn([0], 3);
        }).should.throw();
      });
    });

    describe('stringifying', function () {
      it('should stringify the set correctly', function () {
        var set$$1 = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date('2012-12-25T00:00:00.000Z'))];

        var modelicoSet = M.Set.fromArray(set$$1);

        JSON.stringify(modelicoSet).should.be.exactly('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new M.Set(null);
        }).should.throw();
      });
    });

    describe('parsing', function () {
      it('should parse the set correctly', function () {
        var modelicoSet = JSON.parse('["1988-04-16T00:00:00.000Z","2012-12-25T00:00:00.000Z"]', set$$1(date()).reviver);

        should([].concat(toConsumableArray(modelicoSet))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray(modelicoSet))[1].inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);

        should([].concat(toConsumableArray(author.importantDatesSet()))[0].inner().getFullYear()).be.exactly(2013);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoSet1 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));
        var modelicoSet2 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

        modelicoSet1.should.not.be.exactly(modelicoSet2);
        modelicoSet1.should.not.equal(modelicoSet2);

        modelicoSet1.equals(modelicoSet1).should.be.exactly(true);
        modelicoSet1.equals(modelicoSet2).should.be.exactly(true);

        modelicoSet1.equals(/abc/).should.be.exactly(false);
        M.Set.EMPTY().equals(modelicoSet1).should.be.exactly(false);
      });

      it('should have same-value-zero semantics', function () {
        M.Set.of(0).equals(M.Set.of(-0)).should.be.exactly(true);
        M.Set.of(NaN).equals(M.Set.of(NaN)).should.be.exactly(true);
      });

      it('should support simple unordered checks', function () {
        M.Set.of(1, 2, 3).equals(M.Set.of(1, 3, 2)).should.be.exactly(false);

        M.Set.of(1, 2, 3).equals(M.Set.of(1, 3, 2), true).should.be.exactly(true);

        M.Set.of(1, 2, 3).equals(M.Set.of(1, 4, 2), true).should.be.exactly(false);
      });
    });

    describe('EMPTY / of / fromArray / fromSet', function () {
      it('should have a static property for the empty set', function () {
        should(M.Set.EMPTY().inner().size).be.exactly(0);

        M.Set.EMPTY().toJSON().should.eql([]);

        new M.Set().should.be.exactly(M.Set.of()).and.exactly(M.Set.EMPTY());
      });

      it('should be able to create a set from arbitrary parameters', function () {
        var modelicoSet = M.Set.of(0, 1, 1, 2, 3, 5, 8);

        [].concat(toConsumableArray(modelicoSet)).should.eql([0, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a set from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoSet = M.Set.fromArray(fibArray);

        [].concat(toConsumableArray(modelicoSet)).should.eql([0, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a set from a native set', function () {
        var fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

        var modelicoSet = M.Set.fromSet(fibSet);

        [].concat(toConsumableArray(modelicoSet)).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.Set.of()).should.be.exactly('[object ModelicoSet]');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoMaybe = (function (U, should, M, _ref) {
  var Person = _ref.Person,
      PartOfDay = _ref.PartOfDay;
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        number = _M$metadata.number,
        maybe = _M$metadata.maybe;

    var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';

    describe('setting', function () {
      it('should set fields recursively returning a new Maybe', function () {
        var maybe1 = JSON.parse(authorJson, maybe(_(Person)).reviver);
        var maybe2 = maybe1.set('givenName', 'Javi');

        maybe2.getOrElse('').givenName().should.be.exactly('Javi');
      });

      it('should not throw upon setting if empty', function () {
        var maybe = M.Maybe.of(null);

        maybe.set('givenName', 'Javier').isEmpty().should.be.exactly(true);
      });

      it('should return a new maybe with a value when the path is empty', function () {
        var maybe1 = M.Just.of(21);
        var maybe2 = M.Nothing;

        var maybe3 = maybe1.setIn([], 22);
        var maybe4 = maybe2.setIn([], 10);
        var maybe5 = maybe2.setIn([], null);

        should(maybe3.getOrElse(0)).be.exactly(22);

        should(maybe4.getOrElse(2)).be.exactly(10);

        should(maybe5.getOrElse(2)).be.exactly(2);
      });

      it('should return an empty Maybe when setting a path beyond Modélico boundaries', function () {
        var maybe1 = M.Just.of({ a: 2 });

        var maybe2 = maybe1.setIn([[{ a: 1 }, 'a']], 200);

        maybe2.isEmpty().should.be.exactly(true);

        M.Just.of(2).set('a', 3).isEmpty().should.be.exactly(true);
      });

      it('should support Maybe of null or undefined', function () {
        should(M.Just.of(null).setIn([], 2).toJSON()).be.exactly(2);

        should(M.Just.of(null).set('a', 2).getOrElse('')).be.exactly(null);

        should(M.Just.of().set('a', 2).getOrElse('')).be.exactly(undefined);
      });
    });

    describe('stringifying', function () {
      it('should stringify Maybe values correctly', function () {
        var maybe1 = M.Just.of(2);
        JSON.stringify(maybe1).should.be.exactly('2');

        var maybe2 = M.Nothing;
        JSON.stringify(maybe2).should.be.exactly('null');
      });

      it('should support arbitrary Modélico types', function () {
        var author = M.fromJSON(Person, authorJson);

        var maybe1 = M.Just.of(author);
        JSON.stringify(maybe1).should.be.exactly(authorJson);

        var maybe2 = M.Nothing;
        JSON.stringify(maybe2).should.be.exactly('null');
      });

      it('should support Maybe of null or undefined', function () {
        JSON.stringify(M.Just.of(null)).should.be.exactly('null');

        JSON.stringify(M.Just.of()).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse Maybe values correctly', function () {
        var maybe1 = JSON.parse('2', maybe(number()).reviver);
        should(maybe1.getOrElse(10)).be.exactly(2);

        var maybe2 = JSON.parse('null', maybe(number()).reviver);
        maybe2.isEmpty().should.be.exactly(true);

        var maybe3 = M.genericsFromJS(M.Maybe, [function () {
          return number();
        }], 5);
        should(maybe3.getOrElse(0)).be.exactly(5);
      });

      it('should support arbitrary Modélico types', function () {
        var author = JSON.parse(authorJson, _(Person).reviver);

        var myMaybe = JSON.parse(authorJson, maybe(_(Person)).reviver);
        myMaybe.inner().equals(author).should.be.exactly(true);
      });

      it('should parse missing keys of Maybe values as Maybe with Nothing', function () {
        var authorJsonWithMissinMaybe = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[]}';

        var author = JSON.parse(authorJsonWithMissinMaybe, _(Person).reviver);

        author.sex().isEmpty().should.be.exactly(true);
      });
    });

    describe('isEmpty', function () {
      it('should return false if there is a value', function () {
        var maybe = M.Just.of(5);

        maybe.isEmpty().should.be.exactly(false);
      });

      it('should return true if there is nothing', function () {
        var maybe1 = M.Maybe.of(null);
        var maybe2 = M.Maybe.of(undefined);
        var maybe3 = M.Maybe.of(NaN);

        maybe1.isEmpty().should.be.exactly(true);
        maybe2.isEmpty().should.be.exactly(true);
        maybe3.isEmpty().should.be.exactly(true);
      });
    });

    describe('getOrElse', function () {
      it('should return the value if it exists', function () {
        var maybe = M.Just.of(5);

        should(maybe.getOrElse(7)).be.exactly(5);
      });

      it('should return the provided default if there is nothing', function () {
        var maybe = M.Nothing;

        should(maybe.getOrElse(7)).be.exactly(7);
      });
    });

    describe('map', function () {
      var partOfDayFromJson = _(PartOfDay).reviver.bind(undefined, '');

      it('should apply a function f to the value and return another Maybe with it', function () {
        var maybeFrom1 = M.Just.of(5);
        var maybeFrom2 = M.Just.of('EVENING');

        var maybeTo1 = maybeFrom1.map(function (x) {
          return 2 * x;
        });
        var maybeTo2 = maybeFrom2.map(partOfDayFromJson);

        should(maybeTo1.getOrElse(0)).be.exactly(10);
        should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(PartOfDay.EVENING());
      });

      it('should return a non-empty Maybe of whatever mapped function returns', function () {
        var maybeFrom1 = M.Nothing;
        var maybeFrom2 = M.Just.of(0);

        var maybeTo1 = maybeFrom1.map(function (x) {
          return 2 * x;
        });
        var maybeTo2 = maybeFrom2.map(function (x) {
          return x / x;
        });

        maybeTo1.isEmpty().should.be.exactly(true);
        maybeTo2.isEmpty().should.be.exactly(false);
      });

      it('should compose well', function () {
        var double = function double(x) {
          return x === null ? 0 : 2 * x;
        };
        var plus5 = function plus5(x) {
          return x === null ? 5 : 5 + x;
        };

        var doublePlus5 = function doublePlus5(x) {
          return plus5(double(x));
        };

        var just10 = M.Just.of(10);

        should(just10.map(doublePlus5).inner()).be.exactly(just10.map(double).map(plus5).inner()).and.exactly(25);

        should(just10.map(function (x) {
          return null;
        }).map(plus5).inner()).be.exactly(5);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMaybe1 = M.Just.of(2);
        var modelicoMaybe2 = M.Just.of(2);

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
      });

      it('supports non-primitive types', function () {
        var modelicoMaybe1 = M.Just.of(M.Number.of(2));
        var modelicoMaybe2 = M.Just.of(M.Number.of(2));

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
        modelicoMaybe1.equals(null).should.be.exactly(false);
        modelicoMaybe1.equals().should.be.exactly(false);
      });

      it('handles nothing well', function () {
        var modelicoMaybe1 = M.Just.of(M.Number.of(2));
        var modelicoMaybe2 = M.Nothing;
        var modelicoMaybe3 = M.Maybe.of();

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(false);
        modelicoMaybe2.equals(modelicoMaybe3).should.be.exactly(true);
      });

      it('should have same-value-zero semantics', function () {
        M.Just.of(0).equals(M.Just.of(-0)).should.be.exactly(true);
        M.Just.of(NaN).equals(M.Just.of(NaN)).should.be.exactly(true);
      });
    });

    U.skipIfNoToStringTagSymbol(describe)('toStringTag', function () {
      it('should implement Symbol.toStringTag', function () {
        Object.prototype.toString.call(M.Just.of(1)).should.be.exactly('[object ModelicoJust]');

        Object.prototype.toString.call(M.Nothing).should.be.exactly('[object ModelicoNothing]');
      });
    });
  };
});

/* eslint-env mocha */

var asIs = (function (U, should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        asIs = _M$metadata.asIs,
        any = _M$metadata.any,
        anyOf = _M$metadata.anyOf,
        string = _M$metadata.string,
        maybe = _M$metadata.maybe;

    describe('toJSON', function () {
      it('should stringify the valfnue as is', function () {
        var mapOfNumbers = M.Map.of('a', 1, 'b', 2);

        JSON.stringify(mapOfNumbers).should.be.exactly('[["a",1],["b",2]]');
      });
    });

    describe('reviver', function () {
      it('should revive the value as is, without the wrapper', function () {
        var asIsObject = JSON.parse('{"two":2}', any().reviver);

        should(asIsObject.two).be.exactly(2);
      });

      it('should support any function', function () {
        var asIsObject = JSON.parse('9', asIs(function (x) {
          return x * 2;
        }).reviver);

        should(asIsObject).be.exactly(18);
      });

      it('should not support null (wrap with Maybe)', function () {
        should(function () {
          return asIs(String).reviver('', null);
        }).throw(/expected a value but got nothing \(null, undefined or NaN\)/);

        maybe(asIs(String)).reviver('', 'aaa').getOrElse('abc').should.be.exactly('aaa');

        maybe(asIs(String)).reviver('', null).getOrElse('abc').should.be.exactly('abc');
      });
    });

    describe('metadata', function () {
      it('should return metadata like type', function () {
        string().type.should.be.exactly(String);

        // using empty anyOf for testing purposes
        var asIsObject = JSON.parse('{"two":2}', anyOf()().reviver);

        should(asIsObject.two).be.exactly(2);
      });

      it('should be immutable', function () {
        (function () {
          asIs().reviver = function (x) {
            return x;
          };
        }).should.throw();
      });
    });
  };
});

/* eslint-env mocha */

var setIn = (function (U, should, M) {
  return function () {
    it('should work across types', function () {
      var hammer = M.Map.of('hammer', 'Can’t Touch This');
      var array1 = M.List.of('totally', 'immutable', hammer);(function () {
        array1.inner()[1] = 'I’m going to mutate you!';
      }).should.throw();

      array1.get(1).should.be.exactly('immutable');

      array1.setIn([2, 'hammer'], 'hm, surely I can mutate this nested object...');

      array1.get(2).inner().get('hammer').should.be.exactly('Can’t Touch This');
    });

    it('should work across types (2)', function () {
      var list = M.List.of('totally', 'immutable');
      var hammer1 = M.Map.fromObject({ hammer: 'Can’t Touch This', list: list });

      hammer1.inner().set('hammer', 'I’m going to mutate you!');
      hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setIn(['list', 1], 'hm, surely I can mutate this nested object...');

      hammer1.inner().get('list').get(1).should.be.exactly('immutable');
    });
  };
});

/* eslint-env mocha */

var featuresSimple = (function (should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        string = _M$metadata.string;

    var Animal = function (_M$Base) {
      inherits(Animal, _M$Base);

      function Animal(props) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
      }

      createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = this.name();
          return name === '' ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }], [{
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            name: string()
          });
        }
      }]);
      return Animal;
    }(M.Base);

    it('should showcase the main features', function () {
      var petJson = '{"name": "Robbie"}';

      var pet1 = JSON.parse(petJson, _(Animal).reviver);

      pet1.speak().should.be.exactly('My name is Robbie!');

      var pet2 = pet1.set('name', 'Bane');

      pet2.name().should.be.exactly('Bane');
      pet1.name().should.be.exactly('Robbie');
    });
  };
});

/* eslint-env mocha */

var featuresAdvanced = (function (should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._,
        any = _M$metadata.any,
        maybe = _M$metadata.maybe,
        list = _M$metadata.list,
        string = _M$metadata.string;

    var Animal = function (_M$Base) {
      inherits(Animal, _M$Base);

      function Animal(props) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
      }

      createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = this.name().getOrElse('');

          return name === '' ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }], [{
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            name: maybe(string())
          });
        }
      }]);
      return Animal;
    }(M.Base);

    var Person = function (_M$Base2) {
      inherits(Person, _M$Base2);

      function Person(props) {
        classCallCheck(this, Person);
        return possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, Person, props));
      }

      createClass(Person, [{
        key: 'fullName',
        value: function fullName() {
          return [this.givenName(), this.familyName()].join(' ').trim();
        }
      }], [{
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            givenName: any(),
            familyName: string(),
            pets: list(maybe(_(Animal)))
          });
        }
      }]);
      return Person;
    }(M.Base);

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [\n        {\n          "name": "Robbie"\n        },\n        null\n      ]\n    }';

      var person1 = JSON.parse(personJson, _(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      var defaultAnimal = new Animal();

      Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      var person3 = person1.setIn(['pets', 0, [defaultAnimal, 'name']], 'Bane');

      person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('').should.be.exactly('Bane');

      person3.pets().get(1).getOrElse(defaultAnimal).name().getOrElse('Unknown').should.be.exactly('Unknown');

      person3.getIn(['pets', 0, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Bane');

      person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Unknown');

      person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('Unknown').should.be.exactly('Robbie');

      var person4 = person1.setIn(['pets', 1, [defaultAnimal, 'name']], 'Robbie');

      person4.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Robbie');

      person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Unknown');
    });
  };
});

/* eslint-env mocha */

var featuresAdvancedES5 = (function (should, M) {
  return function () {
    // use ES5 below
    var m = M.metadata();

    function Animal(fields) {
      M.Base.factory(Animal, fields, this);
    }

    Animal.innerTypes = function () {
      return Object.freeze({
        name: m.maybe(m.string())
      });
    };

    Animal.prototype = Object.create(M.Base.prototype);

    Animal.prototype.speak = function () {
      var name = this.name().getOrElse('');

      return name === '' ? "I don't have a name" : 'My name is ' + name + '!';
    };

    function Person(fields) {
      M.Base.factory(Person, fields, this);
    }

    Person.innerTypes = function () {
      return Object.freeze({
        givenName: m.string(),
        familyName: m.string(),
        pets: m.list(m.maybe(m._(Animal)))
      });
    };

    Person.prototype = Object.create(M.Base.prototype);

    Person.prototype.fullName = function () {
      return [this.givenName(), this.familyName()].join(' ').trim();
    };

    // use > ES5 below
    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [\n        {\n          "name": "Robbie"\n        },\n        null\n      ]\n    }';

      var person1 = JSON.parse(personJson, m._(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      var defaultAnimal = new Animal();

      Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      Array.from(person1.pets()).shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      var person3 = person1.setIn(['pets', 0, [defaultAnimal, 'name']], 'Bane');

      person3.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('').should.be.exactly('Bane');

      person3.pets().get(1).getOrElse(defaultAnimal).name().getOrElse('Unknown').should.be.exactly('Unknown');

      person3.getIn(['pets', 0, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Bane');

      person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Unknown');

      person1.pets().get(0).getOrElse(defaultAnimal).name().getOrElse('Unknown').should.be.exactly('Robbie');

      var person4 = person1.setIn(['pets', 1, [defaultAnimal, 'name']], 'Robbie');

      person4.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Robbie');

      person3.getIn(['pets', 1, [defaultAnimal, 'name'], ['Unknown']]).should.be.exactly('Unknown');
    });
  };
});

/* eslint-env mocha */

var featuresDeepNesting = (function (should, M, fixtures) {
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._;

    it('should revive deeply nested JSON', function () {
      var Region = fixtures.Region,
          countryFactory = fixtures.countryFactory;

      var City = fixtures.cityFactory(M, Region, countryFactory);
      var cityJson = '{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}';

      var city = JSON.parse(cityJson, _(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().code().should.be.exactly('ESP');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });

    it('should support nested keys with different types', function () {
      var Region = fixtures.RegionIncompatibleNameKey,
          countryFactory = fixtures.countryFactory;

      var City = fixtures.cityFactory(M, Region, countryFactory);
      var cityJson = '{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":{"id": 1,"value":"EU"}}}}';

      var city = JSON.parse(cityJson, _(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().code().should.be.exactly('ESP');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });
  };
});

/* eslint-env mocha */

var featuresPolymorphic = (function (should, M, fixtures, _ref) {
  var Ajv = _ref.Ajv;
  return function () {
    describe('Enumerated: default type field', function () {
      var CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER']);

      var _M$metadata = M.metadata(),
          _ = _M$metadata._,
          number = _M$metadata.number,
          stringMap = _M$metadata.stringMap,
          list = _M$metadata.list,
          anyOf = _M$metadata.anyOf;

      var NumberCollection = function (_M$Base) {
        inherits(NumberCollection, _M$Base);

        function NumberCollection(props) {
          classCallCheck(this, NumberCollection);
          return possibleConstructorReturn(this, (NumberCollection.__proto__ || Object.getPrototypeOf(NumberCollection)).call(this, NumberCollection, props));
        }

        createClass(NumberCollection, [{
          key: 'getNumbers',
          value: function getNumbers() {
            var type = this.type,
                collection = this.collection;


            switch (type()) {
              case CollectionType.OBJECT():
                return [].concat(toConsumableArray(collection()[M.symbols.innerOrigSymbol]().values()));
              case CollectionType.ARRAY():
                return [].concat(toConsumableArray(collection()));
              default:
                throw TypeError('Unsupported NumberCollection with type ' + type().toJSON());
            }
          }
        }, {
          key: 'sum',
          value: function sum() {
            return this.getNumbers().reduce(function (acc, x) {
              return acc + x;
            }, 0);
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              type: _(CollectionType),
              collection: anyOf([[stringMap(number()), CollectionType.OBJECT()], [list(number()), CollectionType.ARRAY()]])
            });
          }
        }]);
        return NumberCollection;
      }(M.Base);

      it('should revive polymorphic JSON (1)', function () {
        var col1 = M.fromJS(NumberCollection, {
          type: 'OBJECT',
          collection: { 'a': 10, 'b': 25, 'c': 4000 }
        });

        should(col1.sum()).be.exactly(4035);
      });

      it('should revive polymorphic JSON (2)', function () {
        var col2 = M.fromJS(NumberCollection, {
          type: 'ARRAY',
          collection: [1, 2, 3, 4, 3]
        });

        should(col2.sum()).be.exactly(13);
      });

      it('should revive polymorphic JSON (3)', function () {
        should(function () {
          return M.fromJS(NumberCollection, {
            type: 'OTHER',
            collection: '1,2,3,4,5'
          });
        }).throw(/unsupported enumerator "OTHER" at ""/);
      });
    });

    describe('Enumerated: custom field', function () {
      var CollectionType = M.Enum.fromArray(['OBJECT', 'ARRAY', 'OTHER']);

      var _M$metadata2 = M.metadata(),
          _ = _M$metadata2._,
          number = _M$metadata2.number,
          stringMap = _M$metadata2.stringMap,
          list = _M$metadata2.list,
          anyOf = _M$metadata2.anyOf;

      var NumberCollection = function (_M$Base2) {
        inherits(NumberCollection, _M$Base2);

        function NumberCollection(props) {
          classCallCheck(this, NumberCollection);
          return possibleConstructorReturn(this, (NumberCollection.__proto__ || Object.getPrototypeOf(NumberCollection)).call(this, NumberCollection, props));
        }

        createClass(NumberCollection, [{
          key: 'getNumbers',
          value: function getNumbers() {
            var collectionType = this.collectionType,
                collection = this.collection;


            switch (collectionType()) {
              case CollectionType.OBJECT():
                return [].concat(toConsumableArray(collection()[M.symbols.innerOrigSymbol]().values()));
              case CollectionType.ARRAY():
                return [].concat(toConsumableArray(collection()));
              default:
                throw TypeError('Unsupported NumberCollection with type ' + collectionType().toJSON());
            }
          }
        }, {
          key: 'sum',
          value: function sum() {
            return this.getNumbers().reduce(function (acc, x) {
              return acc + x;
            }, 0);
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              collectionType: _(CollectionType),
              collection: anyOf([[stringMap(number()), CollectionType.OBJECT()], [list(number()), CollectionType.ARRAY()]], 'collectionType')
            });
          }
        }]);
        return NumberCollection;
      }(M.Base);

      it('should revive polymorphic JSON (1)', function () {
        var col1 = M.fromJS(NumberCollection, {
          collectionType: 'OBJECT',
          collection: { 'a': 10, 'b': 25, 'c': 4000 }
        });

        should(col1.sum()).be.exactly(4035);
      });

      it('should revive polymorphic JSON (2)', function () {
        var col2 = M.fromJS(NumberCollection, {
          collectionType: 'ARRAY',
          collection: [1, 2, 3, 4, 3]
        });

        should(col2.sum()).be.exactly(13);
      });

      it('should revive polymorphic JSON (3)', function () {
        should(function () {
          return M.fromJS(NumberCollection, {
            collectionType: 'OTHER',
            collection: '1,2,3,4,5'
          });
        }).throw(/unsupported enumerator "OTHER" at ""/);
      });
    });

    describe('Based on runtime type field', function () {
      var _M$ajvMetadata = M.ajvMetadata(Ajv()),
          _ = _M$ajvMetadata._,
          base = _M$ajvMetadata.base,
          ajvMeta = _M$ajvMetadata.ajvMeta,
          ajvNumber = _M$ajvMetadata.ajvNumber,
          ajvString = _M$ajvMetadata.ajvString,
          ajvMaybe = _M$ajvMetadata.ajvMaybe;

      var ShapeType = M.Enum.fromArray(['CIRCLE', 'DIAMOND']);

      var reviver = function reviver(k, v) {
        if (k !== '') {
          return v;
        }

        switch (v.type) {
          case ShapeType.CIRCLE().toJSON():
            return new Circle(v);
          case ShapeType.DIAMOND().toJSON():
            return new Diamond(v);
          default:
            throw TypeError('Unsupported or missing shape type in the Shape reviver.');
        }
      };

      var Shape = function (_M$Base3) {
        inherits(Shape, _M$Base3);

        function Shape() {
          classCallCheck(this, Shape);
          return possibleConstructorReturn(this, (Shape.__proto__ || Object.getPrototypeOf(Shape)).apply(this, arguments));
        }

        createClass(Shape, [{
          key: 'toJSON',
          value: function toJSON() {
            var fields = M.fields(this);
            var type = void 0;

            switch (this[M.symbols.typeSymbol]()) {
              case Circle:
                type = ShapeType.CIRCLE();
                break;
              case Diamond:
                type = ShapeType.DIAMOND();
                break;
              default:
                throw TypeError('Unsupported Shape in the toJSON method.');
            }

            return Object.freeze(Object.assign({ type: type }, fields));
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              relatedShape: ajvMaybe(_(Shape))
            });
          }
        }, {
          key: 'metadata',
          value: function metadata() {
            var baseMetadata = Object.assign({}, base(Shape), { reviver: reviver });

            return ajvMeta(baseMetadata, {}, {}, function () {
              return {
                anyOf: [Circle, Diamond].map(function (x) {
                  return M.getSchema(base(x), false);
                })
              };
            });
          }
        }]);
        return Shape;
      }(M.Base);

      var Circle = function (_Shape) {
        inherits(Circle, _Shape);

        function Circle(props) {
          classCallCheck(this, Circle);
          return possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, Circle, props));
        }

        createClass(Circle, [{
          key: 'area',
          value: function area() {
            return Math.PI * Math.pow(this.radius(), 2);
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze(Object.assign({}, get(Circle.__proto__ || Object.getPrototypeOf(Circle), 'innerTypes', this).call(this), {
              radius: ajvNumber({
                minimum: 0,
                exclusiveMinimum: true
              })
            }));
          }
        }]);
        return Circle;
      }(Shape);

      var Diamond = function (_Shape2) {
        inherits(Diamond, _Shape2);

        function Diamond(props) {
          classCallCheck(this, Diamond);
          return possibleConstructorReturn(this, (Diamond.__proto__ || Object.getPrototypeOf(Diamond)).call(this, Diamond, props));
        }

        createClass(Diamond, [{
          key: 'area',
          value: function area() {
            return this.width() * this.height() / 2;
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze(Object.assign({}, get(Diamond.__proto__ || Object.getPrototypeOf(Diamond), 'innerTypes', this).call(this), {
              width: ajvNumber({
                minimum: 0,
                exclusiveMinimum: true
              }),
              height: ajvNumber({
                minimum: 0,
                exclusiveMinimum: true
              })
            }));
          }
        }]);
        return Diamond;
      }(Shape);

      var Geometer = function (_M$Base4) {
        inherits(Geometer, _M$Base4);

        function Geometer(props) {
          classCallCheck(this, Geometer);
          return possibleConstructorReturn(this, (Geometer.__proto__ || Object.getPrototypeOf(Geometer)).call(this, Geometer, props));
        }

        createClass(Geometer, null, [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              name: ajvString({
                minLength: 1
              }),
              favouriteShape: _(Shape)
            });
          }
        }]);
        return Geometer;
      }(M.Base);

      it('should revive polymorphic JSON', function () {
        var geometer1 = M.fromJS(Geometer, {
          name: 'Audrey',
          favouriteShape: {
            type: 'DIAMOND',
            width: 8,
            height: 7
          }
        });

        var geometer2 = M.fromJS(Geometer, {
          name: 'Javier',
          favouriteShape: {
            type: 'CIRCLE',
            radius: 3
          }
        });

        var geometer3 = new Geometer({
          name: 'Leonardo',
          favouriteShape: new Diamond({
            width: 4,
            height: 12
          })
        });

        should(geometer1.favouriteShape().area()).be.exactly(28);

        should(geometer2.favouriteShape().area()).be.above(28).and.exactly(Math.PI * Math.pow(3, 2));

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

      it('should provide its full schema', function () {
        var expectedSchema = {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1
            },
            favouriteShape: {
              anyOf: [{
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [{
                      type: 'null'
                    }, {
                      $ref: '#/definitions/3'
                    }]
                  },
                  radius: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: ['radius']
              }, {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [{
                      type: 'null'
                    }, {
                      $ref: '#/definitions/3'
                    }]
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
                required: ['width', 'height']
              }]
            }
          },
          required: ['name', 'favouriteShape'],
          definitions: {
            3: {
              anyOf: [{
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [{
                      type: 'null'
                    }, {
                      $ref: '#/definitions/3'
                    }]
                  },
                  radius: {
                    type: 'number',
                    minimum: 0,
                    exclusiveMinimum: true
                  }
                },
                required: ['radius']
              }, {
                type: 'object',
                properties: {
                  relatedShape: {
                    anyOf: [{
                      type: 'null'
                    }, {
                      $ref: '#/definitions/3'
                    }]
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
                required: ['width', 'height']
              }]
            }
          }
        };

        var actualSchema = M.getSchema(_(Geometer));

        actualSchema.should.deepEqual(expectedSchema);
      });
    });

    describe('Based on value only', function () {
      var _M$metadata3 = M.metadata(),
          number = _M$metadata3.number,
          stringMap = _M$metadata3.stringMap,
          list = _M$metadata3.list;

      var NumberCollection = function (_M$Base5) {
        inherits(NumberCollection, _M$Base5);

        function NumberCollection(props) {
          classCallCheck(this, NumberCollection);
          return possibleConstructorReturn(this, (NumberCollection.__proto__ || Object.getPrototypeOf(NumberCollection)).call(this, NumberCollection, props));
        }

        createClass(NumberCollection, [{
          key: 'getNumbers',
          value: function getNumbers() {
            var collection = this.collection();

            return collection[M.symbols.typeSymbol]() === M.List ? [].concat(toConsumableArray(collection)) : [].concat(toConsumableArray(collection[M.symbols.innerOrigSymbol]().values()));
          }
        }, {
          key: 'sum',
          value: function sum() {
            return this.getNumbers().reduce(function (acc, x) {
              return acc + x;
            }, 0);
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              collection: function collection(v) {
                return Array.isArray(v.collection) ? list(number()) : stringMap(number());
              }
            });
          }
        }]);
        return NumberCollection;
      }(M.Base);

      it('should revive polymorphic JSON (1)', function () {
        var col1 = M.fromJS(NumberCollection, {
          collection: { a: 10, b: 25, c: 4000 }
        });

        should(col1.sum()).be.exactly(4035);
      });

      it('should revive polymorphic JSON (2)', function () {
        var col2 = M.fromJS(NumberCollection, {
          collection: [1, 2, 3, 4, 3]
        });

        should(col2.sum()).be.exactly(13);
      });
    });
  };
});

/* eslint-env mocha */

var ImmutableExamples = (function (U, should, M) {
  return function () {
    var objToArr = U.objToArr;

    it('Getting started', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });
      var map2 = map1.set('b', 50);
      should(map1.inner().get('b')).be.exactly(2);
      should(map2.inner().get('b')).be.exactly(50);
    });

    it('The case for Immutability', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });
      var map2 = map1.set('b', 2);
      map1.equals(map2).should.be.exactly(true);
      var map3 = map1.set('b', 50);
      map1.equals(map3).should.be.exactly(false);
    });

    it('JavaScript-first API', function () {
      var list1 = M.List.of(1, 2);

      var list2Array = [].concat(toConsumableArray(list1));
      list2Array.push(3, 4, 5);
      var list2 = M.List.fromArray(list2Array);

      var list3Array = [].concat(toConsumableArray(list2));
      list3Array.unshift(0);
      var list3 = M.List.fromArray(list3Array);

      var list4 = M.List.fromArray([].concat(toConsumableArray(list1)).concat([].concat(toConsumableArray(list2)), [].concat(toConsumableArray(list3))));(list1.size === 2).should.be.exactly(true);(list2.size === 5).should.be.exactly(true);(list3.size === 6).should.be.exactly(true);(list4.size === 13).should.be.exactly(true);(list4.get(0) === 1).should.be.exactly(true);
    });

    it('JavaScript-first API (2)', function () {
      var alpha = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      [].concat(toConsumableArray(alpha)).map(function (kv) {
        return kv[0].toUpperCase();
      }).join().should.be.exactly('A,B,C,D');
    });

    it('Accepts raw JavaScript objects.', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      var map2 = M.Map.fromObject({ c: 10, a: 20, t: 30 });

      var obj = { d: 100, o: 200, g: 300 };

      var map3 = M.Map.fromMap(new Map([].concat([].concat(toConsumableArray(map1)), [].concat(toConsumableArray(map2)), objToArr(obj))));

      map3.equals(M.Map.fromObject({ a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 })).should.be.exactly(true);
    });

    it('Accepts raw JavaScript objects. (2)', function () {
      var myObject = { a: 1, b: 2, c: 3 };

      objToArr(myObject).reduce(function (acc, kv) {
        acc[kv[0]] = Math.pow(kv[1], 2);
        return acc;
      }, {}).should.eql({ a: 1, b: 4, c: 9 });
    });

    it('Accepts raw JavaScript objects. (3)', function () {
      var obj = { 1: 'one' };
      Object.keys(obj)[0].should.be.exactly('1');
      obj['1'].should.be.exactly('one');
      obj[1].should.be.exactly('one');

      var map = M.Map.fromObject(obj);
      map.inner().get('1').should.be.exactly('one');
      should(map.inner().get(1)).be.exactly(undefined);
    });

    it('Equality treats Collections as Data', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 1, c: 1 });
      var map2 = M.Map.fromObject({ a: 1, b: 1, c: 1 });(map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = M.List.of(1, 2, 3);
      var list2Array = [].concat(toConsumableArray(list1));
      list2Array.push(4, 5, 6);
      var list2 = M.List.fromArray(list2Array);([].concat(toConsumableArray(list1)).length === 3).should.be.exactly(true);([].concat(toConsumableArray(list2)).length === 6).should.be.exactly(true);
    });
  };
});

/* eslint-env mocha */

var ImmutableProxied = (function (U, should, M) {
  return function () {
    var _m = M.proxyMap;
    var _l = M.proxyList;

    var objToArr = U.objToArr;

    it('Getting started (proxied)', function () {
      var map1 = _m(M.Map.fromObject({ a: 1, b: 2, c: 3 }));
      var map2 = map1.set('b', 50);
      should(map1.get('b')).be.exactly(2);
      should(map2.get('b')).be.exactly(50);
    });

    it('The case for Immutability', function () {
      var map1 = _m(M.Map.fromObject({ a: 1, b: 2, c: 3 }));
      var map2 = map1.set('b', 2);
      map1.equals(map2).should.be.exactly(true);
      var map3 = map1.set('b', 50);
      map1.equals(map3).should.be.exactly(false);
    });

    it('JavaScript-first API', function () {
      var list1 = _l(M.List.of(1, 2));

      var list2 = list1.push(3, 4, 5);
      var list3 = list2.unshift(0);
      var list4 = list1.concat([].concat(toConsumableArray(list2)), [].concat(toConsumableArray(list3)));(list1.size === 2).should.be.exactly(true);(list2.size === 5).should.be.exactly(true);(list3.size === 6).should.be.exactly(true);(list4.size === 13).should.be.exactly(true);(list4.get(0) === 1).should.be.exactly(true);
    });

    it('JavaScript-first API (2)', function () {
      var alpha = _m(M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 }));

      var res = [];
      alpha.forEach(function (v, k) {
        return res.push(k.toUpperCase());
      });
      res.join().should.be.exactly('A,B,C,D');
    });

    it('Accepts raw JavaScript objects.', function () {
      var map1 = _m(M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 }));
      var map2 = _m(M.Map.fromObject({ c: 10, a: 20, t: 30 }));

      var obj = { d: 100, o: 200, g: 300 };

      var map3 = M.Map.fromMap(new Map([].concat([].concat(toConsumableArray(map1.entries())), [].concat(toConsumableArray(map2.entries())), objToArr(obj))));

      map3.equals(M.Map.fromObject({ a: 20, b: 2, c: 10, d: 100, t: 30, o: 200, g: 300 })).should.be.exactly(true);
    });

    it('Accepts raw JavaScript objects. (2)', function () {
      var map = _m(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      var res = {};
      map.forEach(function (v, k) {
        res[k] = v * v;
      });
      res.should.eql({ a: 1, b: 4, c: 9 });
    });

    it('Accepts raw JavaScript objects. (3)', function () {
      var obj = { 1: 'one' };
      Object.keys(obj)[0].should.be.exactly('1');
      obj['1'].should.be.exactly('one');
      obj[1].should.be.exactly('one');

      var map = _m(M.Map.fromObject(obj));
      map.get('1').should.be.exactly('one');
      should(map.get(1)).be.exactly(undefined);
    });

    it('Equality treats Collections as Data', function () {
      var map1 = _m(M.Map.fromObject({ a: 1, b: 1, c: 1 }));
      var map2 = _m(M.Map.fromObject({ a: 1, b: 1, c: 1 }));(map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = _l(M.List.of(1, 2, 3));

      var res = [].concat(toConsumableArray(list1));
      res.push(4);
      res.push(5);
      res.push(6);
      var list2 = _l(M.List.fromArray(res));(list1.length === 3).should.be.exactly(true);(list2.length === 6).should.be.exactly(true);
    });
  };
});

/* eslint-env mocha */

var proxyMap = (function (should, M) {
  return function () {
    var p = M.proxyMap;

    it('size', function () {
      var map = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      map.size.should.be.exactly(3);
    });

    it('get() / set() / delete() / clear()', function () {
      var map1 = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      var map2 = map1.set('b', 50);

      map1.get('b').should.be.exactly(2);
      map2.get('b').should.be.exactly(50);

      var map3 = map2.delete('c');

      map2.get('c').should.be.exactly(3);
      map3.has('c').should.be.exactly(false);

      var map4 = map3.clear();

      map3.size.should.be.exactly(2);
      map4.size.should.be.exactly(0);
    });

    it('entries()', function () {
      var map = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      [].concat(toConsumableArray(map.entries())).should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('values() / keys() / [@@iterator]()', function () {
      var map = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      [].concat(toConsumableArray(map.values())).should.eql([1, 2, 3]);

      [].concat(toConsumableArray(map.keys())).should.eql(['a', 'b', 'c']);

      [].concat(toConsumableArray(map[Symbol.iterator]())).should.eql([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('forEach()', function () {
      var map = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      var sum = 0;
      var keys = '';

      map.forEach(function (v, k) {
        sum += v;
        keys += k.toUpperCase();
      });

      sum.should.be.exactly(6);
      keys.should.be.exactly('ABC');
    });
  };
});

/* eslint-env mocha */

var proxyList = (function (should, M) {
  return function () {
    var p = M.proxyList;

    it('length', function () {
      var list1 = p(M.List.of(1, 2, 2, 3));list1.length.should.be.exactly(4);
    });

    it('[n]', function () {
      var list1 = p(M.List.of(1, 2, 2, 3));

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

    it('includes()', function () {
      var list = p(M.List.of(1, 2, 3));

      list.includes(2).should.be.exactly(true);

      list.includes(4).should.be.exactly(false);

      list.includes(3, 3).should.be.exactly(false);

      list.includes(3, -1).should.be.exactly(true);

      p(M.List.of(1, 2, NaN)).includes(NaN).should.be.exactly(true);
    });

    it('join()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      list.join('-').should.be.exactly('1-2-2-3');
    });

    it('indexOf()', function () {
      var list = p(M.List.of(2, 9, 9));

      list.indexOf(2).should.be.exactly(0);

      list.indexOf(7).should.be.exactly(-1);

      list.indexOf(9, 2).should.be.exactly(2);

      list.indexOf(9).should.be.exactly(1);

      list.indexOf(2, -1).should.be.exactly(-1);

      list.indexOf(2, -3).should.be.exactly(0);
    });

    it('lastIndexOf()', function () {
      var list = p(M.List.of(2, 5, 9, 2));

      list.lastIndexOf(2).should.be.exactly(3);

      list.lastIndexOf(7).should.be.exactly(-1);

      list.lastIndexOf(2, 3).should.be.exactly(3);

      list.lastIndexOf(2, 2).should.be.exactly(0);

      list.lastIndexOf(2, -2).should.be.exactly(0);

      list.lastIndexOf(2, -1).should.be.exactly(3);
    });

    it('concat()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      list.concat(100).toJSON().should.eql([1, 2, 2, 3, 100]);

      list.concat([100, 200]).toJSON().should.eql([1, 2, 2, 3, 100, 200]);
    });

    it('slice()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      list.slice(1).toJSON().should.eql([2, 2, 3]);

      list.slice(2).set(0, 100).toJSON().should.eql([100, 3]);

      list.slice(2).toJSON().should.eql([2, 3]);

      list.slice(-3).toJSON().should.eql([2, 2, 3]);

      list.slice(0, -2).toJSON().should.eql([1, 2]);
    });

    it('filter()', function () {
      var list = p(M.List.of(1, 2, 3));

      list.filter(function (x) {
        return x % 2 === 1;
      }).toJSON().should.eql([1, 3]);
    });

    it('forEach()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      var sum = 0;
      list.forEach(function (x) {
        sum += x;
      });sum.should.be.exactly(8);
    });

    it('keys() / entries() / [@@iterator]()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      Array.from(list.entries()).should.eql([[0, 1], [1, 2], [2, 2], [3, 3]]);

      Array.from(list.keys()).should.eql([0, 1, 2, 3]);

      Array.from(list[Symbol.iterator]()).should.eql([1, 2, 2, 3]);
    });

    it('every() / some()', function () {
      var list = p(M.List.of(1, 2, 3));

      list.every(function (x) {
        return x < 5;
      }).should.be.exactly(true);

      list.every(function (x) {
        return x < 3;
      }).should.be.exactly(false);

      list.some(function (x) {
        return x > 5;
      }).should.be.exactly(false);

      list.some(function (x) {
        return x < 3;
      }).should.be.exactly(true);
    });

    it('find() / findIndex()', function () {
      var list = p(M.List.of(2, 5, 9, 2));

      var multipleOf = function multipleOf(x) {
        return function (n) {
          return n % x === 0;
        };
      };

      list.find(multipleOf(3)).should.be.exactly(9);

      list.findIndex(multipleOf(3)).should.be.exactly(2);
    });

    it('reduce() / reduceRight()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      list.reduce(function (a, b) {
        return a + b;
      }, 0).should.be.exactly(8);

      list.reduce(function (str, x) {
        return str + x;
      }, '').should.be.exactly('1223');

      list.reduceRight(function (str, x) {
        return str + x;
      }, '').should.be.exactly('3221');
    });

    it('reverse()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      list.reverse().toJSON().should.eql([3, 2, 2, 1]);

      list.toJSON().should.eql([1, 2, 2, 3]);
    });

    it('copyWithin()', function () {
      var list = p(M.List.of(1, 2, 3, 4, 5));

      list.copyWithin(-2).toJSON().should.eql([1, 2, 3, 1, 2]);

      list.copyWithin(0, 3).toJSON().should.eql([4, 5, 3, 4, 5]);

      list.copyWithin(0, 3, 4).toJSON().should.eql([4, 2, 3, 4, 5]);

      list.copyWithin(-2, -3, -1).toJSON().should.eql([1, 2, 3, 3, 4]);
    });

    it('fill()', function () {
      var list = p(M.List.of(1, 2, 3));

      list.fill(4).toJSON().should.eql([4, 4, 4]);

      list.fill(4, 1, 2).toJSON().should.eql([1, 4, 3]);

      list.fill(4, 1, 1).toJSON().should.eql([1, 2, 3]);

      list.fill(4, -3, -2).toJSON().should.eql([4, 2, 3]);

      list.fill(4, NaN, NaN).toJSON().should.eql([1, 2, 3]);

      p(M.List.fromArray(Array(3))).fill(4).toJSON().should.eql([4, 4, 4]);
    });

    it('sort()', function () {
      var list = p(M.List.of(1, 2, 5, 4, 3));

      Array.from(list.sort()).should.eql([1, 2, 3, 4, 5]);

      Array.from(list.sort()).should.eql([1, 2, 3, 4, 5]);
    });

    it('sort(fn)', function () {
      var list = p(M.List.of(1, 2, 5, 4, 3));

      var isEven = function isEven(n) {
        return n % 2 === 0;
      };

      var evensBeforeOdds = function evensBeforeOdds(a, b) {
        if (isEven(a)) {
          return isEven(b) ? a - b : -1;
        }

        return isEven(b) ? 1 : a - b;
      };

      list.sort(evensBeforeOdds).toJSON().should.eql([2, 4, 1, 3, 5]);
    });

    it('map()', function () {
      var list = p(M.List.of(1, 2, 3));

      list.map(function (x) {
        return x + 10;
      }).should.eql([11, 12, 13]);
    });
  };
});

/* eslint-env mocha */

var proxySet = (function (should, M) {
  return function () {
    var p = M.proxySet;

    it('size', function () {
      var set$$1 = p(M.Set.of(1, 2, 2, 3));

      set$$1.size.should.be.exactly(3);
    });

    it('has() / add() / delete() / clear()', function () {
      var set1 = p(M.Set.of(1, 2, 2, 3));

      set1.has(3).should.be.exactly(true);
      set1.has(50).should.be.exactly(false);

      var set2 = set1.add(50);

      set1.has(50).should.be.exactly(false);
      set2.has(50).should.be.exactly(true);

      var set3 = set2.delete(50);

      set2.has(50).should.be.exactly(true);
      set3.has(50).should.be.exactly(false);

      var set4 = set1.clear();

      set4.size.should.be.exactly(0);
    });

    it('entries()', function () {
      var set$$1 = p(M.Set.of(1, 2, 2, 3));

      [].concat(toConsumableArray(set$$1.entries())).should.eql([[1, 1], [2, 2], [3, 3]]);
    });

    it('values() / keys() / [@@iterator]()', function () {
      var set$$1 = p(M.Set.of(1, 2, 2, 3));

      [].concat(toConsumableArray(set$$1.values())).should.eql([1, 2, 3]);

      [].concat(toConsumableArray(set$$1.keys())).should.eql([1, 2, 3]);

      [].concat(toConsumableArray(set$$1[Symbol.iterator]())).should.eql([1, 2, 3]);
    });

    it('forEach()', function () {
      var set$$1 = p(M.Set.of(1, 2, 2, 3));

      var sum = 0;
      set$$1.forEach(function (x) {
        sum += x;
      });

      sum.should.be.exactly(6);
    });
  };
});

/* eslint-env mocha */

var proxyDate = (function (should, M) {
  return function () {
    var p = M.proxyDate;

    it('getters / setters', function () {
      var date1 = p(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

      var date2 = date1.setFullYear(2015);
      var date3 = date2.setMinutes(55);

      date2.getFullYear().should.be.exactly(2015);

      date1.getFullYear().should.be.exactly(1988);

      date1.getMinutes().should.be.exactly(0);

      date3.getMinutes().should.be.exactly(55);
    });
  };
});

/* eslint-env mocha */

var c51 = (function (should, M) {
  return function () {
    var _M$metadata = M.metadata(),
        string = _M$metadata.string;

    var Country = function (_M$Base) {
      inherits(Country, _M$Base);

      function Country(code) {
        classCallCheck(this, Country);
        return possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, { code: code }));
      }

      createClass(Country, null, [{
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            code: string()
          });
        }
      }]);
      return Country;
    }(M.Base);

    it('should leave root elements that are not plain objects untouched', function () {
      M.fromJSON(Country, '"ESP"').code().should.be.exactly('ESP');
    });
  };
});

/* eslint-env mocha */

var cases = (function (should, M) {
  return function () {
    describe('51: root elements', c51(should, M));
  };
});

/* eslint-env mocha */

var personFactory = (function (M, PartOfDay, Sex) {
  var joinWithSpace = function joinWithSpace() {
    for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
      parts[_key] = arguments[_key];
    }

    return parts.join(' ').trim();
  };

  var _M$metadata = M.metadata(),
      _ = _M$metadata._,
      string = _M$metadata.string,
      date = _M$metadata.date,
      map = _M$metadata.map,
      list = _M$metadata.list,
      set$$1 = _M$metadata.set,
      maybe = _M$metadata.maybe;

  var partOfDay = PartOfDay.metadata;
  var sex = Sex.metadata;

  var Person = function (_M$Base) {
    inherits(Person, _M$Base);

    function Person(props) {
      classCallCheck(this, Person);
      return possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, Person, props));
    }

    createClass(Person, [{
      key: 'fullName',
      value: function fullName() {
        return joinWithSpace(this.givenName(), this.familyName());
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          givenName: string(),
          familyName: string(),

          birthday: _(M.Date),
          // alternative (leaving the above for testing purposes)
          // birthday: date(),

          favouritePartOfDay: partOfDay(),
          lifeEvents: map(string(), date()),
          importantDatesList: list(date()),
          importantDatesSet: set$$1(date()),
          sex: maybe(sex())
        });
      }
    }]);
    return Person;
  }(M.Base);

  return Object.freeze(Person);
});

/* eslint-env mocha */

var range = function range(minTime, maxTime) {
  return { minTime: minTime, maxTime: maxTime };
};

var partOfDayFactory = (function (M) {
  var PartOfDay = function (_M$Enum) {
    inherits(PartOfDay, _M$Enum);

    function PartOfDay() {
      classCallCheck(this, PartOfDay);
      return possibleConstructorReturn(this, (PartOfDay.__proto__ || Object.getPrototypeOf(PartOfDay)).apply(this, arguments));
    }

    createClass(PartOfDay, null, [{
      key: 'innerTypes',
      value: function innerTypes() {
        return M.Enum.innerTypes();
      }
    }]);
    return PartOfDay;
  }(M.Enum);

  return M.Enum.fromObject({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  }, PartOfDay, 'PartOfDay');
});

/* eslint-env mocha */

var sexFactory = (function (M) {
  return M.Enum.fromArray(['FEMALE', 'MALE', 'OTHER']);
});

/* eslint-env mocha */

var animalFactory = (function (M) {
  var _M$metadata = M.metadata(),
      string = _M$metadata.string;

  var Animal = function (_M$Base) {
    inherits(Animal, _M$Base);

    function Animal(props) {
      classCallCheck(this, Animal);
      return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
    }

    createClass(Animal, [{
      key: 'speak',
      value: function speak() {
        return 'hello';
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: string()
        });
      }
    }]);
    return Animal;
  }(M.Base);

  return Object.freeze(Animal);
});

/* eslint-env mocha */

var friendFactory = (function (M) {
  var _M$metadata = M.metadata(),
      _ = _M$metadata._,
      string = _M$metadata.string,
      maybe = _M$metadata.maybe;

  var Friend = function (_M$Base) {
    inherits(Friend, _M$Base);

    function Friend(props) {
      classCallCheck(this, Friend);
      return possibleConstructorReturn(this, (Friend.__proto__ || Object.getPrototypeOf(Friend)).call(this, Friend, props));
    }

    createClass(Friend, null, [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: string(),
          bestFriend: maybe(_(Friend))
        });
      }
    }]);
    return Friend;
  }(M.Base);

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Nothing
  });

  return Object.freeze(Friend);
});

/* eslint-env mocha */

var cityFactory = (function (M, Region, countryFactory) {
  var Country = countryFactory(M, Region);

  var _M$metadata = M.metadata(),
      _ = _M$metadata._,
      string = _M$metadata.string;

  var City = function (_M$Base) {
    inherits(City, _M$Base);

    function City(props) {
      classCallCheck(this, City);
      return possibleConstructorReturn(this, (City.__proto__ || Object.getPrototypeOf(City)).call(this, City, props));
    }

    createClass(City, null, [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          name: string(),
          country: _(Country)
        });
      }
    }]);
    return City;
  }(M.Base);

  return Object.freeze(City);
});

/* eslint-env mocha */

var countryFactory = (function (M, Region) {
  var _M$metadata = M.metadata(),
      _ = _M$metadata._,
      string = _M$metadata.string;

  var Country = function (_M$Base) {
    inherits(Country, _M$Base);

    function Country(props) {
      classCallCheck(this, Country);
      return possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, props));
    }

    createClass(Country, null, [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          name: string(),
          code: string(),
          region: _(Region)
        });
      }
    }]);
    return Country;
  }(M.Base);

  return Object.freeze(Country);
});

/* eslint-env mocha */

var regionFactory = (function (M) {
  var _M$metadata = M.metadata(),
      string = _M$metadata.string;

  var Region = function (_M$Base) {
    inherits(Region, _M$Base);

    function Region(props) {
      classCallCheck(this, Region);
      return possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, props));
    }

    createClass(Region, [{
      key: "customMethod",
      value: function customMethod() {
        return this.name() + " (" + this.code() + ")";
      }
    }], [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          name: string(),
          code: string()
        });
      }
    }]);
    return Region;
  }(M.Base);

  return Object.freeze(Region);
});

/* eslint-env mocha */

var regionIncompatibleNameKeyFactory = (function (M) {
  var _M$metadata = M.metadata(),
      _ = _M$metadata._,
      number = _M$metadata.number,
      string = _M$metadata.string;

  var Code = function (_M$Base) {
    inherits(Code, _M$Base);

    function Code(props) {
      classCallCheck(this, Code);
      return possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).call(this, Code, props));
    }

    createClass(Code, null, [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          id: number(),
          value: string()
        });
      }
    }]);
    return Code;
  }(M.Base);

  var Region = function (_M$Base2) {
    inherits(Region, _M$Base2);

    function Region(props) {
      classCallCheck(this, Region);
      return possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, props));
    }

    createClass(Region, [{
      key: "customMethod",
      value: function customMethod() {
        return this.name() + " (" + this.code().value() + ")";
      }
    }], [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          name: string(),
          code: _(Code)
        });
      }
    }]);
    return Region;
  }(M.Base);

  return Object.freeze(Region);
});

var currencyFactory = (function (_ref) {
  var M = _ref.M;

  return M.Enum.fromArray(['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']);
});

var localDateFactory = (function (_ref) {
  var M = _ref.M,
      Ajv = _ref.Ajv,
      validationEnabled = _ref.validationEnabled,
      ajvOptions = _ref.ajvOptions;

  var _M$ajvMetadata = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined),
      base = _M$ajvMetadata.base,
      ajvMeta = _M$ajvMetadata.ajvMeta;

  var reviver = function reviver(k, v) {
    return new (Function.prototype.bind.apply(LocalDate, [null].concat(toConsumableArray(v.split('-').map(Number)))))();
  };

  var LocalDate = function (_M$Base) {
    inherits(LocalDate, _M$Base);

    function LocalDate(year, month, day) {
      classCallCheck(this, LocalDate);

      var _this = possibleConstructorReturn(this, (LocalDate.__proto__ || Object.getPrototypeOf(LocalDate)).call(this, LocalDate, { year: year, month: month, day: day }));

      _this.year = function () {
        return year;
      };
      _this.month = function () {
        return month;
      };
      _this.day = function () {
        return day;
      };

      Object.freeze(_this);
      return _this;
    }

    createClass(LocalDate, [{
      key: 'toJSON',
      value: function toJSON() {
        var year = this.year,
            month = this.month,
            day = this.day;


        return year() + '-' + month() + '-' + day();
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({});
      }
    }, {
      key: 'metadata',
      value: function metadata() {
        var baseMetadata = Object.assign({}, base(LocalDate), { reviver: reviver });

        // baseMetadata as a function for testing purposes
        return ajvMeta(function () {
          return baseMetadata;
        }, {
          type: 'string',
          pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
        });
      }
    }]);
    return LocalDate;
  }(M.Base);

  return LocalDate;
});

var fixerIoResultFactory = (function (_ref, _ref2) {
  var M = _ref.M,
      Ajv = _ref.Ajv,
      validationEnabled = _ref.validationEnabled,
      ajvOptions = _ref.ajvOptions;

  var _ref3 = slicedToArray(_ref2, 2),
      Currency = _ref3[0],
      LocalDate = _ref3[1];

  var _M$ajvMetadata = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined),
      _ = _M$ajvMetadata._,
      ajvEnum = _M$ajvMetadata.ajvEnum,
      ajvEnumMap = _M$ajvMetadata.ajvEnumMap,
      ajvNumber = _M$ajvMetadata.ajvNumber;

  var FixerIoResult = function (_M$Base) {
    inherits(FixerIoResult, _M$Base);

    function FixerIoResult(fields) {
      classCallCheck(this, FixerIoResult);

      // ensure base is included in the rates
      var rates = fields.rates.set(fields.base, 1);
      var enhancedFields = Object.assign({}, fields, { rates: rates });

      var _this = possibleConstructorReturn(this, (FixerIoResult.__proto__ || Object.getPrototypeOf(FixerIoResult)).call(this, FixerIoResult, enhancedFields));

      Object.freeze(_this);
      return _this;
    }

    createClass(FixerIoResult, [{
      key: "convert",
      value: function convert(from, to, x) {
        var rates = this.rates();

        return x * rates.get(to) / rates.get(from);
      }
    }], [{
      key: "innerTypes",
      value: function innerTypes() {
        return Object.freeze({
          base: ajvEnum(Currency),
          date: _(LocalDate),
          rates: ajvEnumMap({}, ajvEnum(Currency), ajvNumber({ minimum: 0, exclusiveMinimum: true }))
        });
      }
    }]);
    return FixerIoResult;
  }(M.Base);

  return FixerIoResult;
});

var fixerIoFactory = (function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      M = _ref.M,
      Ajv = _ref.Ajv,
      _ref$ajvOptions = _ref.ajvOptions,
      ajvOptions = _ref$ajvOptions === undefined ? {} : _ref$ajvOptions,
      _ref$validationEnable = _ref.validationEnabled,
      validationEnabled = _ref$validationEnable === undefined ? true : _ref$validationEnable;

  var options = { M: M, Ajv: Ajv, ajvOptions: ajvOptions, validationEnabled: validationEnabled };
  var Currency = currencyFactory({ M: M });
  var LocalDate = localDateFactory(options);

  return Object.freeze({
    Currency: Currency,
    FixerIoResult: fixerIoResultFactory(options, [Currency, LocalDate])
  });
});

/* eslint-env mocha */

var json = '\n{\n  "base": "EUR",\n  "date": "2017-03-02",\n  "rates": {\n    "AUD": 1.384,\n    "BGN": 1.9558,\n    "BRL": 3.2687,\n    "CAD": 1.4069,\n    "CHF": 1.0651,\n    "CNY": 7.2399,\n    "CZK": 27.021,\n    "DKK": 7.4336,\n    "GBP": 0.8556,\n    "HKD": 8.1622,\n    "HRK": 7.4193,\n    "HUF": 308.33,\n    "IDR": 14045,\n    "ILS": 3.881,\n    "INR": 70.2,\n    "JPY": 120.24,\n    "KRW": 1204.3,\n    "MXN": 20.95,\n    "MYR": 4.6777,\n    "NOK": 8.883,\n    "NZD": 1.4823,\n    "PHP": 52.997,\n    "PLN": 4.2941,\n    "RON": 4.522,\n    "RUB": 61.68,\n    "SEK": 9.5195,\n    "SGD": 1.484,\n    "THB": 36.804,\n    "TRY": 3.8972,\n    "USD": 1.0514,\n    "ZAR": 13.78\n  }\n}\n';

var fixerIoSpec = (function (should, M, _ref, _ref2) {
  var fixerIoFactory = _ref.fixerIoFactory;
  var Ajv = _ref2.Ajv;
  return function () {
    var _M$metadata = M.metadata(),
        _ = _M$metadata._;

    var _fixerIoFactory = fixerIoFactory({ M: M, Ajv: Ajv }),
        FixerIoResult = _fixerIoFactory.FixerIoResult,
        Currency = _fixerIoFactory.Currency;

    it('should parse results from fixer.io', function () {
      var fixerIoResult = M.fromJSON(FixerIoResult, json);

      fixerIoResult.base().should.be.exactly(Currency.EUR());

      fixerIoResult.date().year().should.be.exactly(2017);
      fixerIoResult.date().month().should.be.exactly(3);
      fixerIoResult.date().day().should.be.exactly(2);

      fixerIoResult.rates().get(Currency.AUD()).should.be.exactly(1.384);
    });

    it('should convert between any available currencies', function () {
      var GBP = Currency.GBP,
          USD = Currency.USD,
          EUR = Currency.EUR,
          AUD = Currency.AUD,
          CNY = Currency.CNY;


      var fixerIoResult = M.fromJSON(FixerIoResult, json);

      fixerIoResult.convert(GBP(), USD(), 7.20).toFixed(2).should.be.exactly('8.85');

      fixerIoResult.convert(EUR(), AUD(), 15).toFixed(2).should.be.exactly('20.76');

      fixerIoResult.convert(CNY(), EUR(), 500).toFixed(2).should.be.exactly('69.06');
    });

    it('should generate the right schema', function () {
      var schema = M.getSchema(_(FixerIoResult));

      var expectedSchema = {
        type: 'object',
        properties: {
          base: {
            enum: ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']
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
        required: ['base', 'date', 'rates']
      };

      schema.should.deepEqual(expectedSchema);

      Ajv().validate(schema, JSON.parse(json)).should.be.exactly(true);
    });
  };
});

/* eslint-env mocha */
var ajvMetadata = (function (should, M, fixtures, _ref) {
  var Ajv = _ref.Ajv;
  return function () {
    var _M$ajvMetadata = M.ajvMetadata(Ajv()),
        ajv_ = _M$ajvMetadata.ajv_,
        ajvBase = _M$ajvMetadata.ajvBase,
        ajvAsIs = _M$ajvMetadata.ajvAsIs,
        ajvAny = _M$ajvMetadata.ajvAny,
        ajvString = _M$ajvMetadata.ajvString,
        ajvNumber = _M$ajvMetadata.ajvNumber,
        ajvBoolean = _M$ajvMetadata.ajvBoolean,
        ajvDate = _M$ajvMetadata.ajvDate,
        ajvEnum = _M$ajvMetadata.ajvEnum,
        ajvEnumMap = _M$ajvMetadata.ajvEnumMap,
        ajvList = _M$ajvMetadata.ajvList,
        ajvMap = _M$ajvMetadata.ajvMap,
        ajvStringMap = _M$ajvMetadata.ajvStringMap,
        ajvSet = _M$ajvMetadata.ajvSet,
        ajvMaybe = _M$ajvMetadata.ajvMaybe,
        ajvWithDefault = _M$ajvMetadata.ajvWithDefault,
        ajvAnyOf = _M$ajvMetadata.ajvAnyOf,
        _ = _M$ajvMetadata._,
        base = _M$ajvMetadata.base,
        number = _M$ajvMetadata.number;

    describe('Animal example', function () {
      var Animal = function (_M$Base) {
        inherits(Animal, _M$Base);

        function Animal(props) {
          classCallCheck(this, Animal);
          return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
        }

        createClass(Animal, null, [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
              dimensions: ajvMaybe(ajvList({ minItems: 3, maxItems: 3 }, ajvNumber({ minimum: 0, exclusiveMinimum: true })))
            });
          }
        }]);
        return Animal;
      }(M.Base);

      var Animal2 = function (_M$Base2) {
        inherits(Animal2, _M$Base2);

        function Animal2(props) {
          classCallCheck(this, Animal2);
          return possibleConstructorReturn(this, (Animal2.__proto__ || Object.getPrototypeOf(Animal2)).call(this, Animal, props));
        }

        createClass(Animal2, null, [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              name: ajvString({ minLength: 1, maxLength: 25 }),
              dimensions: ajvMaybe(ajvList({ minItems: 3, maxItems: 3 }, number()))
            });
          }
        }]);
        return Animal2;
      }(M.Base);

      it('should revive as usual with valid JSON', function () {
        var bane1 = M.fromJS(Animal, {
          name: 'Bane',
          dimensions: [20, 55, 65]
        });

        bane1.name().should.be.exactly('Bane');

        bane1.dimensions().getOrElse([1, 1, 1]).equals(M.List.of(20, 55, 65)).should.be.exactly(true);
      });

      it('should allow additional properties by default', function () {
        M.fromJS(Animal, {
          name: 'Bane',
          dimensions: [20, 55, 65],
          extra: 1
        }).should.not.throw();
      });

      it('should fail with invalid JSON', function () {
        should(function () {
          return M.fromJS(Animal, {
            name: 'Bane',
            dimensions: [20, 55, 0]
          });
        }).throw(/Invalid JSON at "dimensions -> 2"/).and.throw(/should be > 0/);
      });

      it('should be able to return the whole schema', function () {
        var bane = M.fromJS(Animal, {
          name: 'Bane',
          dimensions: [20, 55, 65]
        });

        var animalNormalMeta = _(fixtures.Animal);
        var animalNormalMetaSchema = M.getSchema(animalNormalMeta);

        animalNormalMetaSchema.should.deepEqual({
          type: 'object',
          properties: {
            name: {}
          },
          required: ['name']
        });

        var animalMeta = ajv_(Animal);
        var animal1Schema1 = M.getSchema(animalMeta);
        var animal1Schema2 = M.getSchema(animalMeta);

        animal1Schema1.should.deepEqual(animal1Schema2).and.deepEqual({
          type: 'object',
          properties: {
            name: {
              default: 'unknown',
              anyOf: [{ type: 'null' }, {
                default: 'unknown',
                type: 'string',
                minLength: 1,
                maxLength: 25
              }]
            },
            dimensions: {
              anyOf: [{ type: 'null' }, {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: {
                  type: 'number',
                  exclusiveMinimum: true,
                  minimum: 0
                }
              }]
            }
          }
        });

        var animalSchema2 = M.getSchema(ajv_(Animal2));

        animalSchema2.should.deepEqual({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 25
            },
            dimensions: {
              anyOf: [{ type: 'null' }, {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: {}
              }]
            }
          },
          required: ['name']
        });

        var ajv = Ajv();

        ajv.validate(animal1Schema1, bane.toJS()).should.be.exactly(true);

        ajv.validate(animal1Schema1, bane.set('name', 'Robbie').toJS()).should.be.exactly(true);

        ajv.validate(animal1Schema1, bane.set('name', 2).toJS()).should.be.exactly(false);
      });
    });

    describe('deeply nested error examples', function () {
      it('list', function () {
        should(function () {
          return M.ajvGenericsFromJSON(ajv_, M.List, {}, [ajvList({}, ajvList({}, ajvNumber({ minimum: 5 })))], '[[[10], [6, 7, 4]]]');
        }).throw(/Invalid JSON at "0 -> 1 -> 2"/).and.throw(/should be >= 5/);
      });

      it('set', function () {
        should(function () {
          return M.genericsFromJS(M.Set, [ajvSet({}, ajvSet({}, ajvNumber({ minimum: 5 })))], [[[10], [6, 7, 9, 4]]]);
        }).throw(/Invalid JSON at "0 -> 1 -> 3"/).and.throw(/should be >= 5/);
      });

      it('stringMap', function () {
        should(function () {
          return M.genericsFromJS(M.StringMap, [ajvStringMap({}, ajvStringMap({}, ajvNumber({ minimum: 5 })))], { a: { b1: { c: 10 }, b2: { d1: 6, d2: 7, d3: 4 } } });
        }).throw(/Invalid JSON at "a -> b2 -> d3"/).and.throw(/should be >= 5/);
      });

      it('map', function () {
        should(function () {
          return M.genericsFromJS(M.Map, [ajvString(), ajvMap({}, ajvString(), ajvNumber({ minimum: 5 }))], [['A', [['A', 6], ['B', 7], ['C', 4]]]]);
        }).throw(/Invalid JSON at "0 -> 1 -> 2 -> 1"/).and.throw(/should be >= 5/);

        should(function () {
          return M.genericsFromJS(M.Map, [ajvString(), ajvMap({}, ajvString(), ajvNumber({ minimum: 5 }))], [['A', [['A', 6], ['B', 7], [2, 7]]]]);
        }).throw(/Invalid JSON at "0 -> 1 -> 2 -> 0"/).and.throw(/should be string/);
      });

      it('enumMap', function () {
        var SideEnum = M.Enum.fromArray(['A', 'B']);

        should(function () {
          return M.genericsFromJS(M.EnumMap, [ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({ minimum: 5 })))], { A: { A: { A: 10 }, B: { A: 4, B: 7 } } });
        }).throw(/Invalid JSON at "A -> B -> A"/).and.throw(/should be >= 5/);

        should(function () {
          return M.genericsFromJS(M.EnumMap, [ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvEnumMap({}, ajv_(SideEnum), ajvNumber({ minimum: 5 })))], { A: { A: { A: 10 }, B: { D: 5, B: 7 } } });
        }).throw(/Invalid JSON at "A -> B"/).and.throw(/should NOT have additional properties/);
      });
    });

    describe('togglability', function () {
      var _M$ajvMetadata2 = M.ajvMetadata(),
          nonValidatedString = _M$ajvMetadata2.ajvString;

      it('defaults to normal behaviour when Ajv is undefined', function () {
        JSON.parse('"aa"', nonValidatedString({ minLength: 3 }).reviver).should.be.exactly('aa');

        should(function () {
          return JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver);
        }).throw(/shorter than 3 characters/);
      });
    });

    describe('asIs', function () {
      it('supports missing schema', function () {
        JSON.parse('"test"', ajvAsIs().reviver).should.be.exactly('test');
      });

      it('supports valid values with schema', function () {
        JSON.parse('"test"', ajvAsIs({ type: 'string' }).reviver).should.be.exactly('test');
      });

      it('supports valid values with schema and transformer', function () {
        JSON.parse('"test"', ajvAsIs({ type: 'string', maxLength: 5 }, function (x) {
          return x.repeat(2);
        }).reviver).should.be.exactly('testtest');
      });

      it('rejects invalid values', function () {
        should(function () {
          return JSON.parse('1', ajvAsIs({ type: 'string' }).reviver);
        }).throw(/should be string/);

        should(function () {
          return JSON.parse('"testtest"', ajvAsIs({ type: 'string', maxLength: 5 }).reviver);
        }).throw(/should NOT be longer than 5 characters/);
      });
    });

    describe('any', function () {
      it('supports missing schema', function () {
        JSON.parse('"test"', ajvAny().reviver).should.be.exactly('test');

        should(JSON.parse('1', ajvAny().reviver)).be.exactly(1);
      });

      it('supports valid values with schema', function () {
        JSON.parse('"test"', ajvAny({ type: 'string' }).reviver).should.be.exactly('test');
      });

      it('rejects invalid values', function () {
        should(function () {
          return JSON.parse('1', ajvAny({ type: 'string' }).reviver);
        }).throw(/should be string/);
      });
    });

    describe('number', function () {
      it('reports the right type', function () {
        ajvNumber().type.should.be.exactly(Number);
      });

      it('supports missing schema', function () {
        should(JSON.parse('1', ajvNumber().reviver)).be.exactly(1);
      });

      it('supports valid numbers with schema', function () {
        should(JSON.parse('4', ajvNumber({ minimum: 3 }).reviver)).be.exactly(4);
      });

      it('rejects invalid numbers', function () {
        should(function () {
          return JSON.parse('2', ajvNumber({ minimum: 3 }).reviver);
        }).throw(/should be >= 3/);
      });
    });

    describe('number: wrapped json-compatible', function () {
      it('reports the right type', function () {
        ajvNumber({}, { wrap: true }).type.should.be.exactly(M.Number);
      });

      it('supports missing schema', function () {
        should(JSON.parse('1', ajvNumber({}, { wrap: true }).reviver).inner()).be.exactly(1);
      });

      it('supports valid numbers with schema', function () {
        should(JSON.parse('4', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner()).be.exactly(4);
      });

      it('rejects invalid numbers', function () {
        should(function () {
          return JSON.parse('2', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner();
        }).throw(/should be >= 3/);
      });
    });

    describe('number: wrapped non-json-compatible', function () {
      it('supports missing schema', function () {
        should(JSON.parse('"-Infinity"', ajvNumber({}, { wrap: true }).reviver).inner()).be.exactly(-Infinity);
      });

      it('supports valid numbers with schema', function () {
        should(JSON.parse('"Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner()).be.exactly(Infinity);
      });

      it('rejects invalid numbers', function () {
        should(function () {
          return JSON.parse('"-Infinity"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner();
        }).throw(/should be >= 3/);

        should(function () {
          return JSON.parse('"1"', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner();
        }).throw(/should be number/);

        should(function () {
          return JSON.parse('{"a": 1}', ajvNumber({ minimum: 3 }, { wrap: true }).reviver).inner();
        }).throw(/should be number/);
      });
    });

    describe('string', function () {
      it('reports the right type', function () {
        ajvString().type.should.be.exactly(String);
      });

      it('supports missing schema', function () {
        JSON.parse('"test"', ajvString().reviver).should.be.exactly('test');
      });

      it('supports valid strings with schema', function () {
        JSON.parse('"test"', ajvString({ minLength: 3 }).reviver).should.be.exactly('test');
      });

      it('rejects invalid strings', function () {
        should(function () {
          return JSON.parse('"aa"', ajvString({ minLength: 3 }).reviver);
        }).throw(/shorter than 3 characters/);
      });
    });

    describe('boolean', function () {
      it('reports the right type', function () {
        ajvBoolean().type.should.be.exactly(Boolean);
      });

      it('supports valid booleans', function () {
        JSON.parse('true', ajvBoolean().reviver).should.be.exactly(true);
      });

      it('rejects invalid booleans', function () {
        should(function () {
          return JSON.parse('1', ajvBoolean().reviver);
        }).throw(/should be boolean/);
      });
    });

    describe('date', function () {
      it('reports the right type', function () {
        ajvDate().type.should.be.exactly(M.Date);
      });

      it('supports valid dates', function () {
        should(JSON.parse('"1988-04-16T00:00:00.000Z"', ajvDate().reviver).inner().getFullYear()).be.exactly(1988);
      });

      it('rejects invalid dates', function () {
        should(function () {
          return JSON.parse('"1988-04-16T00:00:00.000"', ajvDate().reviver);
        }).throw(/should match format "date-time"/);

        should(function () {
          return JSON.parse('"1988-04-16"', ajvDate().reviver);
        }).throw(/should match format "date-time"/);
      });
    });

    describe('enum', function () {
      it('reports its full schema', function () {
        var Side = M.Enum.fromArray(['A', 'B']);

        M.getSchema(ajvEnum(Side)).should.deepEqual({ enum: ['A', 'B'] });
      });
    });

    describe('enumMap', function () {
      var Side = function (_M$Enum) {
        inherits(Side, _M$Enum);

        function Side() {
          classCallCheck(this, Side);
          return possibleConstructorReturn(this, (Side.__proto__ || Object.getPrototypeOf(Side)).apply(this, arguments));
        }

        return Side;
      }(M.Enum);

      var SideEnum = M.Enum.fromArray(['A', 'B'], Side, 'Side');

      it('reports its full schema', function () {
        var meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber());

        M.getSchema(meta).should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {
              type: 'number'
            }
          }
        });

        var meta2 = ajvEnumMap({}, ajv_(SideEnum), number());

        M.getSchema(meta2).should.deepEqual({
          type: 'object',
          maxProperties: 2,
          additionalProperties: false,
          patternProperties: {
            '^(A|B)$': {}
          }
        });
      });

      it('reports the right types', function () {
        var meta = ajvEnumMap({}, ajv_(SideEnum), ajvNumber());

        meta.type.should.be.exactly(M.EnumMap);
        meta.subtypes[0].type.should.be.exactly(Side);
        meta.subtypes[1].type.should.be.exactly(Number);
      });

      it('supports empty schema', function () {
        should(JSON.parse('{"B": 100}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B())).be.exactly(100);
      });

      it('supports valid enumMaps with schema', function () {
        should(JSON.parse('{"B": 100}', ajvEnumMap({ minProperties: 1 }, ajv_(SideEnum), ajvNumber()).reviver).get(SideEnum.B())).be.exactly(100);
      });

      it('rejects invalid enumMaps', function () {
        should(function () {
          return JSON.parse('{"A": 100}', ajvEnumMap({ minProperties: 2 }, ajv_(SideEnum), ajvNumber()).reviver);
        }).throw(/should NOT have less than 2 properties/);

        should(function () {
          return JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({}, ajv_(SideEnum), ajvNumber()).reviver);
        }).throw(/should NOT have more than 2 properties/);

        should(function () {
          return JSON.parse('{"A": 100, "B": 200, "C": 300}', ajvEnumMap({ maxProperties: 3 }, ajv_(SideEnum), ajvNumber()).reviver);
        }).throw(/Invalid JSON at ""/).and.throw(/should NOT have additional properties/);
      });
    });

    describe('list', function () {
      it('list', function () {
        M.getSchema(ajvList({ minItems: 2 }, ajvNumber({ minimum: 5 }))).should.deepEqual({
          type: 'array',
          minItems: 2,
          items: {
            type: 'number',
            minimum: 5
          }
        });
      });

      it('reports the right types', function () {
        ajvList({}, ajvString()).type.should.be.exactly(M.List);
        ajvList({}, ajvString()).subtypes[0].type.should.be.exactly(String);
      });

      it('supports empty schema', function () {
        JSON.parse('[2,5]', ajvList({}, ajvNumber()).reviver).equals(M.List.of(2, 5)).should.be.exactly(true);
      });

      it('supports valid lists with schema', function () {
        JSON.parse('[2,5]', ajvList({ maxItems: 3 }, ajvNumber()).reviver).equals(M.List.of(2, 5)).should.be.exactly(true);
      });

      it('rejects invalid lists', function () {
        should(function () {
          return JSON.parse('[2,5,7,1]', ajvList({ maxItems: 3 }, ajvNumber()).reviver);
        }).throw(/should NOT have more than 3 items/);
      });
    });

    describe('tuple', function () {
      it('valid data', function () {
        var metadata = ajvList({}, [ajvString(), ajvNumber()]);

        JSON.parse('["a",5]', metadata.reviver).equals(M.List.of('a', 5)).should.be.exactly(true);

        M.getSchema(metadata).should.deepEqual({
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: [{ type: 'string' }, { type: 'number' }]
        });
      });

      it('nested modelico object', function () {
        var Animal = function (_M$Base3) {
          inherits(Animal, _M$Base3);

          function Animal(props) {
            classCallCheck(this, Animal);
            return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
          }

          createClass(Animal, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                name: ajvWithDefault(ajvString({ minLength: 1, maxLength: 25 }), 'unknown'),
                dimensions: ajvList({ minItems: 3, maxItems: 3 }, ajvNumber({ minimum: 0, exclusiveMinimum: true }))
              });
            }
          }]);
          return Animal;
        }(M.Base);

        var metadata = ajvList({}, [ajvString(), _(Animal)]);

        M.genericsFromJS(M.List, [[ajvString(), _(Animal)]], ['a', {
          name: 'Bane',
          dimensions: [20, 55, 65]
        }]).equals(M.List.of('a', new Animal({
          name: 'Bane',
          dimensions: M.List.of(20, 55, 65)
        }))).should.be.exactly(true);

        M.getSchema(metadata).should.deepEqual({
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: [{ type: 'string' }, {
            type: 'object',
            required: ['dimensions'],
            properties: {
              name: {
                default: 'unknown',
                anyOf: [{ type: 'null' }, {
                  default: 'unknown',
                  type: 'string',
                  minLength: 1,
                  maxLength: 25
                }]
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
          }]
        });
      });

      it('invalid data', function () {
        var metadata = ajvList({}, [ajvString(), ajvNumber()]);

        should(function () {
          return JSON.parse('["a",true]', metadata.reviver);
        }).throw(/should be number/);

        should(function () {
          return JSON.parse('["a"]', metadata.reviver);
        }).throw(/should NOT have less than 2 items/);

        should(function () {
          return JSON.parse('["a",1,2]', metadata.reviver);
        }).throw(/should NOT have more than 2 items/);
      });

      it('maybe', function () {
        M.genericsFromJSON(M.List, [[ajvString(), ajvMaybe(ajvNumber())]], '["a",1]').equals(M.List.of('a', M.Just.of(1))).should.be.exactly(true);

        M.genericsFromJSON(M.List, [[ajvString(), ajvMaybe(ajvNumber())]], '["a",null]').equals(M.List.of('a', M.Nothing)).should.be.exactly(true);
      });
    });

    describe('map', function () {
      it('reports its full schema', function () {
        var meta = ajvMap({}, ajvNumber(), ajvString());

        M.getSchema(meta).should.deepEqual({
          type: 'array',
          items: {
            type: 'array',
            maxItems: 2,
            minItems: 2,
            items: [{ type: 'number' }, { type: 'string' }]
          }
        });
      });

      it('reports the right types', function () {
        var meta = ajvMap({}, ajvNumber(), ajvString());

        meta.type.should.be.exactly(M.Map);
        meta.subtypes[0].type.should.be.exactly(Number);
        meta.subtypes[1].type.should.be.exactly(String);
      });

      it('supports empty schema', function () {
        JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({}, ajvNumber(), ajvString()).reviver).equals(M.Map.of(2, 'dos', 5, 'cinco')).should.be.exactly(true);
      });

      it('supports valid maps with schema', function () {
        JSON.parse('[[2, "dos"],[5, "cinco"]]', ajvMap({ minItems: 2 }, ajvNumber(), ajvString()).reviver).equals(M.Map.of(2, 'dos', 5, 'cinco')).should.be.exactly(true);
      });

      it('rejects invalid maps', function () {
        should(function () {
          return JSON.parse('[[2, "dos", "extra"]]', ajvMap({}, ajvNumber(), ajvString()).reviver);
        }).throw(/should NOT have more than 2 items/);

        should(function () {
          return JSON.parse('[[2]]', ajvMap({}, ajvNumber(), ajvString()).reviver);
        }).throw(/should NOT have less than 2 items/);

        should(function () {
          return JSON.parse('[[1, "uno"], [2, "dos"], [3, "tres"]]', ajvMap({ minItems: 4 }, ajvNumber(), ajvString()).reviver);
        }).throw(/should NOT have less than 4 items/);
      });
    });

    describe('stringMap', function () {
      it('reports its full schema', function () {
        var meta = ajvStringMap({}, ajvNumber());

        M.getSchema(meta).should.deepEqual({
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '.*': {
              type: 'number'
            }
          }
        });
      });

      it('reports the right types', function () {
        var meta = ajvStringMap({}, ajvNumber());

        meta.type.should.be.exactly(M.StringMap);
        meta.subtypes[0].type.should.be.exactly(Number);
      });

      it('supports empty schema', function () {
        should(JSON.parse('{"uno": 1}', ajvStringMap({}, ajvNumber()).reviver).get('uno')).be.exactly(1);
      });

      it('supports valid stringMaps with schema', function () {
        should(JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 1 }, ajvNumber()).reviver).get('uno')).be.exactly(1);
      });

      it('rejects invalid stringMaps', function () {
        should(function () {
          return JSON.parse('{"uno": 1}', ajvStringMap({ minProperties: 2 }, ajvNumber()).reviver);
        }).throw(/should NOT have less than 2 properties/);
      });
    });

    describe('set', function () {
      it('reports its full schema', function () {
        var meta = ajvSet({}, ajvNumber());

        M.getSchema(meta).should.deepEqual({
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'number'
          }
        });
      });

      it('reports the right types', function () {
        ajvSet({}, ajvNumber()).type.should.be.exactly(M.Set);
        ajvSet({}, ajvNumber()).subtypes[0].type.should.be.exactly(Number);
      });

      it('supports empty schema', function () {
        JSON.parse('[2,5]', ajvSet({}, ajvNumber()).reviver).equals(M.Set.of(2, 5)).should.be.exactly(true);
      });

      it('supports valid sets with schema', function () {
        JSON.parse('[2,5]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver).equals(M.Set.of(2, 5)).should.be.exactly(true);
      });

      it('rejects invalid sets', function () {
        should(function () {
          return JSON.parse('[2,5,7,1]', ajvSet({ maxItems: 3 }, ajvNumber()).reviver);
        }).throw(/should NOT have more than 3 items/);
      });

      it('rejects duplicated values by default', function () {
        should(function () {
          return JSON.parse('[2,5,5]', ajvSet({}, ajvNumber()).reviver);
        }).throw(/should NOT have duplicate items/);
      });

      it('supports duplicates when explicitly told', function () {
        JSON.parse('[2,5,5]', ajvSet({ uniqueItems: false }, ajvNumber()).reviver).equals(M.Set.of(2, 5)).should.be.exactly(true);
      });
    });

    describe('maybe', function () {
      it('reports the right types', function () {
        ajvMaybe(ajvString()).type.should.be.exactly(M.Maybe);
        ajvMaybe(ajvString()).subtypes[0].type.should.be.exactly(String);
      });

      it('behaves just as the normal maybe metadata', function () {
        JSON.parse('null', ajvMaybe(ajvString()).reviver).getOrElse('fallback').should.be.exactly('fallback');

        JSON.parse('"Javier"', ajvMaybe(ajvString()).reviver).getOrElse('fallback').should.be.exactly('Javier');
      });
    });

    describe('ajvWithDefault', function () {
      it('should validate the default value', function () {
        var CountryCode = function (_M$Base4) {
          inherits(CountryCode, _M$Base4);

          function CountryCode(props) {
            classCallCheck(this, CountryCode);
            return possibleConstructorReturn(this, (CountryCode.__proto__ || Object.getPrototypeOf(CountryCode)).call(this, CountryCode, props));
          }

          createClass(CountryCode, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                value: ajvWithDefault(ajvString({ minLength: 3, maxLength: 3 }), 'SPAIN')
              });
            }
          }]);
          return CountryCode;
        }(M.Base);

        (function () {
          return new CountryCode();
        }).should.throw(/should NOT be longer than 3 characters/);
      });
    });

    describe('recipe: validate within the constructor', function () {
      var ajv = Ajv();

      it('should validate the default value', function () {
        var CountryCode = function (_M$Base5) {
          inherits(CountryCode, _M$Base5);

          function CountryCode(props) {
            classCallCheck(this, CountryCode);

            if (!ajv.validate(M.getSchema(_(CountryCode)), props)) {
              throw TypeError(ajv.errors.map(function (error) {
                return error.message;
              }).join('\n'));
            }

            return possibleConstructorReturn(this, (CountryCode.__proto__ || Object.getPrototypeOf(CountryCode)).call(this, CountryCode, props));
          }

          createClass(CountryCode, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                value: ajvWithDefault(ajvString({ minLength: 3, maxLength: 3 }), 'ESP')
              });
            }
          }]);
          return CountryCode;
        }(M.Base);

        (function () {
          return new CountryCode({ value: 'SPAIN' });
        }).should.throw(/should NOT be longer than 3 characters/);

        var australia = new CountryCode({ value: 'AUS' });

        should(function () {
          return australia.set('value', 'AU');
        }).throw(/should NOT be shorter than 3 characters/);
      });
    });

    describe('recipe: validation at top level', function () {
      var Animal = function (_M$Base6) {
        inherits(Animal, _M$Base6);

        function Animal(props) {
          classCallCheck(this, Animal);
          return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, props));
        }

        createClass(Animal, null, [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              name: ajvString()
            });
          }
        }]);
        return Animal;
      }(M.Base);

      var baseSchema = M.getSchema(base(Animal));

      var enhancedMeta = function enhancedMeta(additionalProperties) {
        return ajvBase(Animal, Object.assign({}, baseSchema, { additionalProperties: additionalProperties }));
      };

      it('supports additional properties unless otherwise stated', function () {
        should(function () {
          return ajvBase(Animal).reviver('', {
            name: 'Bane',
            extra: 1
          });
        }).not.throw();

        should(function () {
          return enhancedMeta(true).reviver('', {
            name: 'Bane',
            extra: 1
          });
        }).not.throw();

        M.getSchema(enhancedMeta(true)).should.deepEqual({
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

      it('supports failing with additional properties', function () {
        should(function () {
          return enhancedMeta(false).reviver('', {
            name: 'Bane',
            extra: 1
          });
        }).throw(/should NOT have additional properties/);

        M.getSchema(enhancedMeta(false)).should.deepEqual({
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

      it('should allow basic validation at top level', function () {
        should(function () {
          return M.ajvFromJSON(ajv_, Animal, { maxProperties: 2 }, '{\n        "name": "Bane",\n        "dimensions": [20, 55, 65],\n        "extra": 1\n      }');
        }).throw(/should NOT have more than 2 properties/);
      });
    });

    describe('withValidation', function () {
      it('facilitates custom validation rules', function () {
        var lowerCaseString = function lowerCaseString(schema) {
          return M.withValidation(function (v) {
            return v.toLowerCase() === v;
          }, function (v, path) {
            return 'string ' + v + ' at "' + path.join(' -> ') + '" is not all lower case';
          })(ajvString(schema));
        };

        JSON.parse('"abc123"', lowerCaseString({ minLength: 5 }).reviver).should.be.exactly('abc123');

        should(function () {
          return JSON.parse('"abc"', lowerCaseString({ minLength: 5 }).reviver);
        }).throw(/should NOT be shorter than 5 characters/);

        should(function () {
          return JSON.parse('"aBc123"', lowerCaseString({ minLength: 5 }).reviver);
        }).throw(/string aBc123 at "" is not all lower case/);
      });

      it('should have a default error message', function () {
        var lowerCaseString = function lowerCaseString(schema) {
          return M.withValidation(function (v) {
            return v.toLowerCase() === v;
          })(ajvString(schema));
        };

        should(function () {
          return JSON.parse('"aBc123"', lowerCaseString({ minLength: 5 }).reviver);
        }).throw(/Invalid value at ""/);
      });

      it('should work for nested metadata', function () {
        var lowerCaseString = function lowerCaseString(schema) {
          return M.withValidation(function (v) {
            return v.toLowerCase() === v;
          }, function (v, path) {
            return 'string ' + v + ' at "' + path.join(' -> ') + '" is not all lower case';
          })(ajvString(schema));
        };

        var MagicString = function (_M$Base7) {
          inherits(MagicString, _M$Base7);

          function MagicString(props) {
            classCallCheck(this, MagicString);
            return possibleConstructorReturn(this, (MagicString.__proto__ || Object.getPrototypeOf(MagicString)).call(this, MagicString, props));
          }

          createClass(MagicString, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                str: lowerCaseString({ minLength: 5 })
              });
            }
          }]);
          return MagicString;
        }(M.Base);

        M.fromJSON(MagicString, '{"str": "abc123"}').str().should.be.exactly('abc123');

        should(function () {
          return M.fromJSON(MagicString, '{"str": "abc"}');
        }).throw(/should NOT be shorter than 5 characters/);

        should(function () {
          return M.fromJSON(MagicString, '{"str": "aBc123"}');
        }).throw(/string aBc123 at "str" is not all lower case/);

        should(function () {
          return JSON.parse('{"str": "abc123", "forceFail": true}', M.withValidation(function (v) {
            return M.fields(v).forceFail !== true;
          }, function () {
            return 'forcibly failed';
          })(_(MagicString)).reviver);
        }).throw(/forcibly failed/);
      });
    });

    describe('anyOf', function () {
      var ScoreType = function (_M$Enum2) {
        inherits(ScoreType, _M$Enum2);

        function ScoreType() {
          classCallCheck(this, ScoreType);
          return possibleConstructorReturn(this, (ScoreType.__proto__ || Object.getPrototypeOf(ScoreType)).apply(this, arguments));
        }

        return ScoreType;
      }(M.Enum);

      var ScoreTypeEnum = M.Enum.fromArray(['Numeric', 'Alphabetic'], ScoreType, 'ScoreType');

      var Score = function (_M$Base8) {
        inherits(Score, _M$Base8);

        function Score(props) {
          classCallCheck(this, Score);
          return possibleConstructorReturn(this, (Score.__proto__ || Object.getPrototypeOf(Score)).call(this, Score, props));
        }

        createClass(Score, null, [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              type: ajvEnum(ScoreTypeEnum),
              score: ajvAnyOf([[ajvNumber({ minimum: 0 }), ScoreTypeEnum.Numeric()], [ajvString({ minLength: 1 }), ScoreTypeEnum.Alphabetic()]])
            });
          }
        }]);
        return Score;
      }(M.Base);

      it('reports its full schema', function () {
        var expectedSchema = {
          type: 'object',
          properties: {
            type: {
              enum: ['Numeric', 'Alphabetic']
            },
            score: {
              anyOf: [{ type: 'number', minimum: 0 }, { type: 'string', minLength: 1 }]
            }
          },
          required: ['type', 'score']
        };

        M.getSchema(_(Score)).should.deepEqual(expectedSchema);
      });
    });

    describe('Circular innerTypes', function () {
      it('self reference', function () {
        var Chain = function (_M$createAjvModel) {
          inherits(Chain, _M$createAjvModel);

          function Chain(props) {
            classCallCheck(this, Chain);
            return possibleConstructorReturn(this, (Chain.__proto__ || Object.getPrototypeOf(Chain)).call(this, Chain, props));
          }

          return Chain;
        }(M.createAjvModel(function (_ref2) {
          var m = _ref2.m;
          return {
            description: m.ajvString({ minLength: 1 }),
            previous: m.ajvMaybe(m._(Chain)),
            next: m.ajvMaybe(m._(Chain)),
            relatedChains: m.ajvList({}, m._(Chain))
          };
        }));

        M.getSchema(_(Chain)).should.deepEqual({
          definitions: {
            '1': {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  minLength: 1
                },
                previous: {
                  anyOf: [{ type: 'null' }, { $ref: '#/definitions/1' }]
                },
                next: {
                  anyOf: [{ type: 'null' }, { $ref: '#/definitions/1' }]
                },
                relatedChains: {
                  type: 'array',
                  items: {
                    '$ref': '#/definitions/1'
                  }
                }
              },
              required: ['description', 'relatedChains']
            }
          },
          $ref: '#/definitions/1'
        });
      });

      it('indirect reference', function () {
        var nonEmptyString = ajvString({ minLength: 1 });

        var maybeChildMetadata = void 0;
        var maybeChild = function maybeChild() {
          if (!maybeChildMetadata) {
            maybeChildMetadata = ajvMaybe(_(Child));
          }

          return maybeChildMetadata;
        };

        var Parent = function (_M$Base9) {
          inherits(Parent, _M$Base9);

          function Parent(props) {
            classCallCheck(this, Parent);
            return possibleConstructorReturn(this, (Parent.__proto__ || Object.getPrototypeOf(Parent)).call(this, Parent, props));
          }

          createClass(Parent, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                name: nonEmptyString,
                child: maybeChild()
              });
            }
          }]);
          return Parent;
        }(M.Base);

        var Child = function (_M$Base10) {
          inherits(Child, _M$Base10);

          function Child(props) {
            classCallCheck(this, Child);
            return possibleConstructorReturn(this, (Child.__proto__ || Object.getPrototypeOf(Child)).call(this, Parent, props));
          }

          createClass(Child, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                name: nonEmptyString,
                parent: _(Parent)
              });
            }
          }]);
          return Child;
        }(M.Base);

        var Person = function (_M$Base11) {
          inherits(Person, _M$Base11);

          function Person(props) {
            classCallCheck(this, Person);
            return possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, Parent, props));
          }

          createClass(Person, null, [{
            key: 'innerTypes',
            value: function innerTypes() {
              return Object.freeze({
                name: nonEmptyString,
                parent: _(Parent),
                child: maybeChild()
              });
            }
          }]);
          return Person;
        }(M.Base);

        M.getSchema(_(Person)).should.deepEqual({
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
                  anyOf: [{ type: 'null' }, {
                    type: 'object',
                    properties: {
                      name: {
                        $ref: '#/definitions/2'
                      },
                      parent: {
                        $ref: '#/definitions/3'
                      }
                    },
                    required: ['name', 'parent']
                  }]
                }
              },
              required: ['name']
            },
            child: {
              anyOf: [{ type: 'null' }, {
                $ref: '#/definitions/4'
              }]
            }
          },
          required: ['name', 'parent'],
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
                  anyOf: [{ type: 'null' }, {
                    type: 'object',
                    properties: {
                      name: {
                        $ref: '#/definitions/2'
                      },
                      parent: {
                        $ref: '#/definitions/3'
                      }
                    },
                    required: ['name', 'parent']
                  }]
                }
              },
              required: ['name']
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
              required: ['name', 'parent']
            }
          }
        });
      });
    });
  };
});

/* eslint-env mocha */
var baseMetadataExample = (function (should, M, fixtures, _ref) {
  var Ajv = _ref.Ajv;
  return function () {
    var _M$ajvMetadata = M.ajvMetadata(Ajv()),
        base = _M$ajvMetadata.base,
        number = _M$ajvMetadata.number,
        ajvAny = _M$ajvMetadata.ajvAny,
        ajvNumber = _M$ajvMetadata.ajvNumber;

    it('should return the base metadata for standard models', function () {
      var customReviver = function customReviver(baseReviver) {
        return function (k, v) {
          var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

          if (k !== '') {
            return v;
          }

          if (v.min > v.max) {
            throw RangeError('"min" must be less than or equal to "max"');
          }

          return baseReviver(k, v, path);
        };
      };

      var Range = function (_M$Base) {
        inherits(Range, _M$Base);

        function Range() {
          var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref2$min = _ref2.min,
              min = _ref2$min === undefined ? -Infinity : _ref2$min,
              _ref2$max = _ref2.max,
              max = _ref2$max === undefined ? Infinity : _ref2$max;

          classCallCheck(this, Range);
          return possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, { min: min, max: max }));
        }

        createClass(Range, [{
          key: 'length',
          value: function length() {
            return this.max() - this.min();
          }
        }], [{
          key: 'innerTypes',
          value: function innerTypes() {
            return Object.freeze({
              min: number(),
              max: number()
            });
          }
        }, {
          key: 'metadata',
          value: function metadata() {
            var baseMetadata = base(Range);
            var baseReviver = baseMetadata.reviver;

            return Object.assign({}, baseMetadata, { reviver: customReviver(baseReviver) });
          }
        }]);
        return Range;
      }(M.Base);

      M.fromJS(Range, { min: 4, max: 6.5 }).length().should.be.exactly(2.5);

      should(function () {
        return M.fromJS(Range, { min: 4, max: 3.5 });
      }).throw('"min" must be less than or equal to "max"');

      var validRange = new Range({ min: 0, max: 5 });
      var invalidRange = validRange.set('max', -5);

      M.validate(validRange)[0].should.be.exactly(true);

      var invalidRangeValidationResult = M.validate(invalidRange);

      invalidRangeValidationResult[0].should.be.exactly(false);

      invalidRangeValidationResult[1].message.should.be.exactly('"min" must be less than or equal to "max"');

      M.validate(M.List.of(3, 2), [ajvNumber()])[0].should.be.exactly(true);

      var listWithMixedData = M.List.of(3, 'a');

      M.validate(listWithMixedData, [ajvAny()])[0].should.be.exactly(true);

      M.validate(listWithMixedData, [ajvNumber()])[0].should.be.exactly(false);

      M.validate(listWithMixedData, [ajvNumber()])[1].message.should.match(/should be number/);
    });
  };
});

/* eslint-env mocha */

var hasProxies = function () {
  try {
    return new Proxy({}, {}) && true;
  } catch (ignore) {}

  return false;
}();

var hasToStringTagSymbol = function () {
  var a = {};

  a[Symbol.toStringTag] = 'foo';

  return a + '' === '[object foo]';
}();

var buildUtils = function buildUtils() {
  return Object.freeze({
    skipIfNoProxies: function skipIfNoProxies(fn) {
      return hasProxies ? fn : fn.skip;
    },
    skipIfNoToStringTagSymbol: function skipIfNoToStringTagSymbol(fn) {
      return hasToStringTagSymbol ? fn : fn.skip;
    },
    objToArr: function objToArr(obj) {
      return Object.keys(obj).map(function (k) {
        return [k, obj[k]];
      });
    }
  });
};

var modelicoSpec = (function (_ref) {
  var Should = _ref.Should,
      M = _ref.Modelico,
      extensions = _ref.extensions;
  return function () {
    var U = buildUtils();

    var PartOfDay = partOfDayFactory(M);
    var Sex = sexFactory(M);

    var fixtures = Object.freeze({
      cityFactory: cityFactory,
      countryFactory: countryFactory,
      fixerIoFactory: fixerIoFactory,
      PartOfDay: PartOfDay,
      Sex: Sex,
      Person: personFactory(M, PartOfDay, Sex),
      Animal: animalFactory(M),
      Friend: friendFactory(M),
      Region: regionFactory(M),
      RegionIncompatibleNameKey: regionIncompatibleNameKeyFactory(M)
    });

    var deps = [Should, M, fixtures, extensions];

    describe('Base', Base.apply(undefined, [U].concat(deps)));
    describe('Number', ModelicoNumber.apply(undefined, [U].concat(deps)));
    describe('Date', ModelicoDate.apply(undefined, [U].concat(deps)));
    describe('Map', ModelicoMap.apply(undefined, [U].concat(deps)));
    describe('StringMap', ModelicoStringMap.apply(undefined, deps));
    describe('Enum', ModelicoEnum.apply(undefined, deps));
    describe('EnumMap', ModelicoEnumMap.apply(undefined, [U].concat(deps)));
    describe('List', ModelicoList.apply(undefined, [U].concat(deps)));
    describe('Set', ModelicoSet.apply(undefined, [U].concat(deps)));
    describe('Maybe', ModelicoMaybe.apply(undefined, [U].concat(deps)));

    describe('asIs', asIs.apply(undefined, [U].concat(deps)));
    describe('setIn', setIn.apply(undefined, [U].concat(deps)));
    describe('ajvMetadata', ajvMetadata.apply(undefined, deps));
    describe('base metadata example', baseMetadataExample.apply(undefined, deps));

    describe('Readme simple features', featuresSimple.apply(undefined, deps));
    describe('Readme advanced features', featuresAdvanced.apply(undefined, deps));
    describe('Readme advanced features ES5', featuresAdvancedES5.apply(undefined, deps));
    describe('Deep nesting features', featuresDeepNesting.apply(undefined, deps));
    describe('Reviving polymrphic JSON', featuresPolymorphic.apply(undefined, deps));
    describe('Immutable.js examples', ImmutableExamples.apply(undefined, [U].concat(deps)));

    describe('Api Example: Fixer IO', fixerIoSpec.apply(undefined, deps));

    U.skipIfNoProxies(describe)('Immutable.js examples (proxied)', ImmutableProxied.apply(undefined, [U].concat(deps)));

    U.skipIfNoProxies(describe)('Proxies', function () {
      describe('Map', proxyMap.apply(undefined, deps));
      describe('List', proxyList.apply(undefined, deps));
      describe('Set', proxySet.apply(undefined, deps));
      describe('Date', proxyDate.apply(undefined, deps));
    });

    describe('Cases', cases.apply(undefined, deps));
  };
});

return modelicoSpec;

})));
