(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.modelicoSpec = factory());
}(this, (function () { 'use strict';

/* eslint-env mocha */

var range = function range(minTime, maxTime) {
  return { minTime: minTime, maxTime: maxTime };
};

var PartOfDayFactory = (function (M) {
  return M.Enum.fromObject({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
});

/* eslint-env mocha */

var SexFactory = (function (M) {
  return M.Enum.fromArray(['FEMALE', 'MALE', 'OTHER']);
});

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



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/* eslint-env mocha */

var PersonFactory = (function (M) {
  var PartOfDay = PartOfDayFactory(M);
  var Sex = SexFactory(M);

  var joinWithSpace = function joinWithSpace() {
    for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
      parts[_key] = arguments[_key];
    }

    return parts.filter(function (x) {
      return x !== null && x !== undefined;
    }).join(' ');
  };

  var _M$metadata = M.metadata,
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

    function Person(fields) {
      classCallCheck(this, Person);

      var _this = possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, Person, fields));

      Object.freeze(_this);
      return _this;
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

var AnimalFactory = (function (M) {
  var string = M.metadata.string;

  var Animal = function (_M$Base) {
    inherits(Animal, _M$Base);

    function Animal(fields) {
      classCallCheck(this, Animal);
      return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
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

var FriendFactory = (function (M) {
  var _M$metadata = M.metadata,
      _ = _M$metadata._,
      string = _M$metadata.string,
      maybe = _M$metadata.maybe;

  var Friend = function (_M$Base) {
    inherits(Friend, _M$Base);

    function Friend(fields) {
      classCallCheck(this, Friend);
      return possibleConstructorReturn(this, (Friend.__proto__ || Object.getPrototypeOf(Friend)).call(this, Friend, fields));
    }

    createClass(Friend, null, [{
      key: 'innerTypes',
      value: function innerTypes(depth) {
        return Object.freeze({
          name: string(),
          bestFriend: maybe(_(Friend, depth))
        });
      }
    }]);
    return Friend;
  }(M.Base);

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Maybe.EMPTY
  });

  return Object.freeze(Friend);
});

/* eslint-env mocha */

var Base = (function (U, should, M) {
  return function () {
    var Person = PersonFactory(M);
    var PartOfDay = PartOfDayFactory(M);
    var Sex = SexFactory(M);
    var Animal = AnimalFactory(M);
    var Friend = FriendFactory(M);
    var _ = M.metadata._;


    var ModelicoDate = M.Date;

    var author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
    var author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

    describe('immutability', function () {
      U.skipIfNoObjectFreeze('must freeze wrapped input', function () {
        var authorFields = {
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        };

        var author = new Person(authorFields);

        (function () {
          authorFields.givenName = 'Javi';
        }).should.throw();

        author.givenName().should.be.exactly('Javier');
      });
    });

    describe('innerTypes check', function () {
      var Country = function (_M$Base) {
        inherits(Country, _M$Base);

        function Country(code) {
          classCallCheck(this, Country);
          return possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, { code: code }));
        }

        return Country;
      }(M.Base);

      it('should throw when static innerTypes are missing', function () {
        (function () {
          return M.fromJSON(Country, '"ESP"');
        }).should.throw(/missing static innerTypes/);
      });
    });

    describe('setting', function () {
      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return M.fromJSON(Person, author2Json);
        }).should.throw();

        (function () {
          return new Person(null);
        }).should.throw();
      });

      it('should set fields returning a new object', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
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
        (author2 === author1).should.be.exactly(false);
        author2.givenName().should.be.exactly('Javi');
        author2.equals(author1).should.be.exactly(false, 'Oops, they are equal');
      });

      it('should set fields recursively returning a new object', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        });

        var author2 = author1.setPath(['givenName'], 'Javi').setPath(['birthday'], new Date('1989-04-16T00:00:00.000Z'));

        should(author2.birthday().inner().getFullYear()).be.exactly(1989);

        // verify that the original author1 was not mutated
        should(author1.birthday().inner().getFullYear()).be.exactly(1988);
      });

      it('edge case when Modelico setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);
        var listOfPeople1 = M.List.of(author);

        var listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
        var listOfPeople3 = listOfPeople2.setPath([0], M.fields(author));

        listOfPeople1.inner()[0].givenName().should.be.exactly('Javier');
        listOfPeople2.inner()[0].givenName().should.be.exactly('Javi');
        listOfPeople3.inner()[0].givenName().should.be.exactly('Javier');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return new Person({
            givenName: 'Javier',
            familyName: 'Cejudo',
            birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
            favouritePartOfDay: null,
            lifeEvents: M.Map.EMPTY,
            importantDatesList: M.List.EMPTY,
            importantDatesSet: M.Set.EMPTY,
            sex: Sex.MALE()
          });
        }).should.throw();
      });
    });

    describe('stringifying', function () {
      it('should stringify types correctly', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        });

        JSON.stringify(author1).should.be.exactly(author1Json);
      });
    });

    describe('parsing', function () {
      it('should parse types correctly', function () {
        var author1 = M.fromJSON(Person, author1Json);
        var author2 = JSON.parse(author1Json, _(Person).reviver);

        'Javier Cejudo'.should.be.exactly(author1.fullName()).and.exactly(author2.fullName());

        should(1988).be.exactly(author1.birthday().inner().getFullYear()).and.exactly(author2.birthday().inner().getFullYear());

        should(PartOfDay.EVENING().minTime).be.exactly(author1.favouritePartOfDay().minTime).and.exactly(author2.favouritePartOfDay().minTime);

        Sex.MALE().toJSON().should.be.exactly(author1.sex().toJSON()).and.exactly(author2.sex().toJSON());
      });

      it('should work with plain classes extending Modelico', function () {
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
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        });

        var author2 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        });

        var author3 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo Goñi',
          birthday: M.Date.of(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          lifeEvents: M.Map.EMPTY,
          importantDatesList: M.List.EMPTY,
          importantDatesSet: M.Set.EMPTY,
          sex: Sex.MALE()
        });

        author1.equals(author1).should.be.exactly(true);
        author1.equals(author2).should.be.exactly(true);
        author1.equals(author3).should.be.exactly(false);
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
      it('a Modelico type can have a key that is a Maybe of its own type', function () {
        var bestFriend = new Friend({
          name: 'John',
          bestFriend: M.Maybe.EMPTY
        });

        var marc = new Friend({
          name: 'Marc',
          bestFriend: M.Maybe.of(bestFriend)
        });

        marc.bestFriend().getOrElse(Friend.EMPTY).name().should.be.exactly('John');
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoNumber = (function (should, M) {
  return function () {
    var number = M.metadata.number;


    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.Number(5);
        }).should.throw();
      });

      it('should cast using Number', function () {
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
        var numberB = numberA.setPath([], 5);

        should(numberA.inner()).be.exactly(2);

        should(numberB.inner()).be.exactly(5);
      });

      it('should not support the set operation', function () {
        var myNumber = M.Number.of(55);

        (function () {
          return myNumber.set();
        }).should.throw();
      });

      it('should not support the setPath operation with non-empty paths', function () {
        var myNumber = M.Number.of(5);

        (function () {
          return myNumber.setPath([0], 7);
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

      it('should have Object.is semantics', function () {
        M.Number.of(0).equals(M.Number.of(-0)).should.be.exactly(false);
        M.Number.of(NaN).equals(M.Number.of(NaN)).should.be.exactly(true);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoDate = (function (should, M) {
  return function () {
    var date = M.metadata.date;


    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Date('1988-04-16T00:00:00.000Z');
        var myDate = M.Date.of(input);

        input.setFullYear(2017);

        should(myDate.inner().getFullYear()).be.exactly(1988);
      });
    });

    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.Date(new Date());
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
        var date2 = date1.setPath([], new Date('1989-04-16T00:00:00.000Z'));

        should(date2.inner().getFullYear()).be.exactly(1989);

        should(date1.inner().getFullYear()).be.exactly(1988);
      });

      it('should not support the set operation', function () {
        var myDate = M.Date.of(new Date());

        (function () {
          return myDate.set();
        }).should.throw();
      });

      it('should not support the setPath operation with non-empty paths', function () {
        var myDate = M.Date.of(new Date());

        (function () {
          return myDate.setPath([0], new Date());
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
  };
});

/* eslint-env mocha */

var ModelicoMap = (function (should, M) {
  return function () {
    var Person = PersonFactory(M);
    var _M$metadata = M.metadata,
        date = _M$metadata.date,
        map = _M$metadata.map,
        number = _M$metadata.number,
        string = _M$metadata.string;


    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Map([['A', 'Good morning!'], ['B', 'Good afternoon!'], ['C', 'Good evening!']]);

        var map = M.Map.fromMap(input);

        input.set('A', "g'day!");

        map.inner().get('A').should.be.exactly('Good morning!');
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
        var author2 = author1.setPath(['lifeEvents', 'wedding'], new Date('2010-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2010);

        // verify that author1 was not mutated
        should(author1.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });

      it('edge case when setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":[],"sex":"MALE"}';
        var author = M.fromJSON(Person, authorJson);

        var map = author.lifeEvents();

        should(map.inner().get('wedding').inner().getFullYear()).be.exactly(2013);

        var customMap = new Map([['wedding', M.Date.of(new Date('2010-03-28T00:00:00.000Z'))]]);

        var map2 = map.setPath([], customMap);

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
        M.Map.EMPTY.equals(modelicoMap).should.be.exactly(false);
      });

      it('should have Object.is and Map key value semantics', function () {
        M.Map.of('a', 0).equals(M.Map.of('a', -0)).should.be.exactly(false);
        M.Map.of('a', NaN).equals(M.Map.of('a', NaN)).should.be.exactly(true);

        M.Map.of(-0, 33).equals(M.Map.of(0, 33)).should.be.exactly(true);
      });
    });

    describe('EMPTY / of / fromArray / fromObject / fromMap', function () {
      it('should have a static property for the empty map', function () {
        should(M.Map.EMPTY.inner().size).be.exactly(0);

        M.Map.EMPTY.toJSON().should.eql([]);
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
  };
});

/* eslint-env mocha */

var ModelicoEnum = (function (should, M) {
  return function () {
    var PartOfDay = PartOfDayFactory(M);

    describe('keys', function () {
      it('only enumerates the enumerators', function () {
        Object.keys(PartOfDay).should.eql(['ANY', 'MORNING', 'AFTERNOON', 'EVENING']);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoEnumMap = (function (should, M) {
  return function () {
    var PartOfDay = PartOfDayFactory(M);
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        any = _M$metadata.any,
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
        var greetings2 = greetings1.setPath([PartOfDay.EVENING()], new Date('2013-04-16T00:00:00.000Z'));

        should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2013);

        should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', function () {
        var map1 = new Map([[PartOfDay.MORNING(), M.Date.of(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), M.Date.of(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), M.Date.of(new Date('2012-04-16T00:00:00.000Z'))]]);

        var map2 = new Map([[PartOfDay.MORNING(), M.Date.of(new Date('1989-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), M.Date.of(new Date('2001-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), M.Date.of(new Date('2013-04-16T00:00:00.000Z'))]]);

        var greetings1 = M.EnumMap.fromMap(map1);
        var greetings2 = greetings1.setPath([], map2);

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
        var greetings = JSON.parse('{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":[]}', enumMap(_(PartOfDay), any()).reviver);

        greetings.inner().get(PartOfDay.MORNING()).should.be.exactly('Good morning!');
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', enumMap(_(PartOfDay), string()).reviver);
        }).should.throw();
      });
    });

    describe('EMPTY /  of /fromMap', function () {
      it('should have a static property for the empty map', function () {
        should(M.EnumMap.EMPTY.inner().size).be.exactly(0);

        M.EnumMap.EMPTY.toJSON().should.eql({});
      });

      it('should be able to create an enum map from an even number of params', function () {
        var map = M.EnumMap.of(PartOfDay.MORNING(), 1, PartOfDay.AFTERNOON(), 2, PartOfDay.EVENING(), 3);

        should(map.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);

        (function () {
          return M.EnumMap.of(PartOfDay.MORNING(), 1, PartOfDay.AFTERNOON());
        }).should.throw();
      });

      it('should be able to create an enum map from a native map', function () {
        var enumMap = M.EnumMap.fromMap(new Map([[PartOfDay.MORNING(), 1], [PartOfDay.AFTERNOON(), 2]]));

        should(enumMap.inner().get(PartOfDay.AFTERNOON())).be.exactly(2);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoList = (function (should, M) {
  return function () {
    var Person = PersonFactory(M);
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        list = _M$metadata.list,
        date = _M$metadata.date;


    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = ['a', 'b', 'c'];
        var list = M.List.fromArray(input);

        input[1] = 'B';

        list.inner()[1].should.be.exactly('b');
      });
    });

    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.List([]);
        }).should.throw();
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var list = M.List.fromArray([1, 2, 3, 4]);

        [].concat(toConsumableArray(list)).should.eql([1, 2, 3, 4]);
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

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date())];

        var modelicoList1 = M.List.fromArray(list);
        var modelicoList2 = modelicoList1.setPath([0], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path with a single element', function () {
        var list = [M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date())];

        var modelicoList1 = M.List.fromArray(list);
        var modelicoList2 = modelicoList1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(2000);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole list', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author1 = JSON.parse(authorJson, _(Person).reviver);

        var newListArray = author1.importantDatesList().inner();
        newListArray.splice(1, 0, M.Date.of(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesList', M.List.fromArray(newListArray));

        should(author1.importantDatesList().inner().length).be.exactly(2);
        should(author1.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
        should(author1.importantDatesList().inner()[1].inner().getFullYear()).be.exactly(2012);

        should(author2.importantDatesList().inner().length).be.exactly(3);
        should(author2.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
        should(author2.importantDatesList().inner()[1].inner().getFullYear()).be.exactly(2016);
        should(author2.importantDatesList().inner()[2].inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when List setPath is called with an empty path', function () {
        var modelicoDatesList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date()));

        var modelicoDatesList2 = [M.Date.of(new Date('2016-04-16T00:00:00.000Z'))];

        var listOfListOfDates1 = M.List.of(modelicoDatesList1);
        var listOfListOfDates2 = listOfListOfDates1.setPath([0], modelicoDatesList2);

        should(listOfListOfDates1.inner()[0].inner()[0].inner().getFullYear()).be.exactly(1988);

        should(listOfListOfDates2.inner()[0].inner()[0].inner().getFullYear()).be.exactly(2016);
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

        should(modelicoList.inner()[0].inner().getFullYear()).be.exactly(1988);

        should(modelicoList.inner()[1].inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"importantDatesSet":[],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);

        should(author.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
      });

      it('should not support null (wrap with Maybe)', function () {
        (function () {
          return JSON.parse('null', list(date()).reviver);
        }).should.throw();
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
        M.List.EMPTY.equals(modelicoList1).should.be.exactly(false);
      });

      it('should support non-primitive types', function () {
        var modelicoList1 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));
        var modelicoList2 = M.List.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')));

        modelicoList1.should.not.be.exactly(modelicoList2);
        modelicoList1.should.not.equal(modelicoList2);

        modelicoList1.equals(modelicoList1).should.be.exactly(true);
        modelicoList1.equals(modelicoList2).should.be.exactly(true);

        M.List.of(2, 4).equals(M.Set.of(2, 4)).should.be.exactly(false);
      });

      it('should have Object.is semantics', function () {
        M.List.of(0).equals(M.List.of(-0)).should.be.exactly(false);
        M.List.of(NaN).equals(M.List.of(NaN)).should.be.exactly(true);
      });
    });

    describe('EMPTY / of / fromArray', function () {
      it('should have a static property for the empty list', function () {
        should(M.List.EMPTY.inner().length).be.exactly(0);

        M.List.EMPTY.toJSON().should.eql([]);
      });

      it('should be able to create a list from arbitrary parameters', function () {
        var modelicoList = M.List.of(0, 1, 1, 2, 3, 5, 8);

        modelicoList.inner().should.eql([0, 1, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a list from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoList = M.List.fromArray(fibArray);

        modelicoList.inner().should.eql([0, 1, 1, 2, 3, 5, 8]);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoSet = (function (should, M) {
  return function () {
    var Person = PersonFactory(M);
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        date = _M$metadata.date,
        set$$1 = _M$metadata.set;


    describe('immutability', function () {
      it('must not reflect changes in the wrapped input', function () {
        var input = new Set(['a', 'b', 'c']);
        var set$$1 = M.Set.fromSet(input);

        input.delete('a');

        set$$1.inner().has('a').should.be.exactly(true);
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

        var newSetArray = [].concat(toConsumableArray(author1.importantDatesSet().inner()));
        newSetArray.splice(1, 0, M.Date.of(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesSet', M.Set.fromArray(newSetArray));

        var author1InnerSet = author1.importantDatesSet().inner();

        should(author1InnerSet.size).be.exactly(2);
        should([].concat(toConsumableArray(author1InnerSet))[0].inner().getFullYear()).be.exactly(2013);
        should([].concat(toConsumableArray(author1InnerSet))[1].inner().getFullYear()).be.exactly(2012);

        var author2InnerSet = author2.importantDatesSet().inner();

        should(author2InnerSet.size).be.exactly(3);
        should([].concat(toConsumableArray(author2InnerSet))[0].inner().getFullYear()).be.exactly(2013);
        should([].concat(toConsumableArray(author2InnerSet))[1].inner().getFullYear()).be.exactly(2016);
        should([].concat(toConsumableArray(author2InnerSet))[2].inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when Set setPath is called with an empty path', function () {
        var modelicoDatesSet1 = M.Set.of(M.Date.of(new Date('1988-04-16T00:00:00.000Z')), M.Date.of(new Date()));

        var modelicoDatesSet2 = new Set([M.Date.of(new Date('2016-04-16T00:00:00.000Z'))]);

        var listOfSetsOfDates1 = M.List.of(modelicoDatesSet1);
        var listOfSetsOfDates2 = listOfSetsOfDates1.setPath([0], modelicoDatesSet2);

        should([].concat(toConsumableArray([].concat(toConsumableArray(listOfSetsOfDates1.inner()))[0].inner()))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray([].concat(toConsumableArray(listOfSetsOfDates2.inner()))[0].inner()))[0].inner().getFullYear()).be.exactly(2016);
      });

      it('should not support the set operation', function () {
        var mySet = M.Set.of(1, 2);

        (function () {
          return mySet.set(0, 3);
        }).should.throw();
      });

      it('should not support the setPath operation with non-empty paths', function () {
        var mySet = M.Set.of(1, 2);

        (function () {
          return mySet.setPath([0], 3);
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

        should([].concat(toConsumableArray(modelicoSet.inner()))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray(modelicoSet.inner()))[1].inner().getMonth()).be.exactly(11);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';
        var author = JSON.parse(authorJson, _(Person).reviver);

        should([].concat(toConsumableArray(author.importantDatesSet().inner()))[0].inner().getFullYear()).be.exactly(2013);
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
        M.Set.EMPTY.equals(modelicoSet1).should.be.exactly(false);
      });

      it('should have Object.is and Set value semantics', function () {
        M.Set.of(0).equals(M.Set.of(-0)).should.be.exactly(true);
        M.Set.of(NaN).equals(M.Set.of(NaN)).should.be.exactly(true);
      });
    });

    describe('EMPTY / of / fromArray / fromSet', function () {
      it('should have a static property for the empty set', function () {
        should(M.Set.EMPTY.inner().size).be.exactly(0);

        M.Set.EMPTY.toJSON().should.eql([]);
      });

      it('should be able to create a set from arbitrary parameters', function () {
        var modelicoSet = M.Set.of(0, 1, 1, 2, 3, 5, 8);

        [].concat(toConsumableArray(modelicoSet.inner())).should.eql([0, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a set from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoSet = M.Set.fromArray(fibArray);

        [].concat(toConsumableArray(modelicoSet.inner())).should.eql([0, 1, 2, 3, 5, 8]);
      });

      it('should be able to create a set from a native set', function () {
        var fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

        var modelicoSet = M.Set.fromSet(fibSet);

        [].concat(toConsumableArray(modelicoSet.inner())).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });
  };
});

/* eslint-env mocha */

var ModelicoMaybe = (function (should, M) {
  return function () {
    var PartOfDay = PartOfDayFactory(M);
    var Person = PersonFactory(M);
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        number = _M$metadata.number,
        maybe = _M$metadata.maybe;


    var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[["wedding","2013-03-28T00:00:00.000Z"],["moved to Australia","2012-12-03T00:00:00.000Z"]],"importantDatesList":[],"importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"],"sex":"MALE"}';

    describe('setting', function () {
      it('should set fields recursively returning a new Maybe', function () {
        var maybe1 = JSON.parse(authorJson, maybe(_(Person)).reviver);
        var maybe2 = maybe1.set('givenName', 'Javi');

        maybe2.inner().get().givenName().should.be.exactly('Javi');
      });

      it('should not throw upon setting if empty', function () {
        var maybe = M.Maybe.of(null);

        maybe.set('givenName', 'Javier').isEmpty().should.be.exactly(true);

        maybe.setPath(['lifeEvents', 'wedding'], new Date()).isEmpty().should.be.exactly(true);
      });

      it('should return a new maybe with a value when the path is empty', function () {
        var maybe1 = M.Maybe.of(21);
        var maybe2 = M.Maybe.of(null);

        var maybe3 = maybe1.setPath([], 22);
        var maybe4 = maybe2.setPath([], 10);
        var maybe5 = maybe2.setPath([], null);

        should(maybe3.getOrElse(0)).be.exactly(22);

        should(maybe4.getOrElse(2)).be.exactly(10);

        should(maybe5.getOrElse(2)).be.exactly(2);
      });

      it('should return an empty Maybe when setting a path beyond Modelico boundaries', function () {
        var maybe1 = M.Maybe.of({ a: 2 });

        var maybe2 = maybe1.setPath(['a'], 200);

        maybe2.isEmpty().should.be.exactly(true);
      });
    });

    describe('stringifying', function () {
      it('should stringify Maybe values correctly', function () {
        var maybe1 = M.Maybe.of(2);
        JSON.stringify(maybe1).should.be.exactly('2');

        var maybe2 = M.Maybe.of(null);
        JSON.stringify(maybe2).should.be.exactly('null');
      });

      it('should support arbitrary Modelico types', function () {
        var author = M.fromJSON(Person, authorJson);

        var maybe1 = M.Maybe.of(author);
        JSON.stringify(maybe1).should.be.exactly(authorJson);

        var maybe2 = M.Maybe.of(null);
        JSON.stringify(maybe2).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse Maybe values correctly', function () {
        var maybe1 = JSON.parse('2', maybe(number()).reviver);
        should(maybe1.getOrElse(10)).be.exactly(2);

        var maybe2 = JSON.parse('null', maybe(number()).reviver);
        maybe2.isEmpty().should.be.exactly(true);
      });

      it('should support arbitrary Modelico types', function () {
        var author = JSON.parse(authorJson, _(Person).reviver);

        var myMaybe = JSON.parse(authorJson, maybe(_(Person)).reviver);
        myMaybe.inner().get().equals(author).should.be.exactly(true);
      });

      it('should parse missing keys of Maybe values as Maybe with Nothing', function () {
        var authorJsonWithMissinMaybe = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","lifeEvents":[],"importantDatesList":[],"importantDatesSet":[]}';

        var author = JSON.parse(authorJsonWithMissinMaybe, _(Person).reviver);

        author.sex().isEmpty().should.be.exactly(true);
      });
    });

    describe('isEmpty', function () {
      it('should return false if there is a value', function () {
        var maybe = M.Maybe.of(5);

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
        var maybe = M.Maybe.of(5);

        should(maybe.getOrElse(7)).be.exactly(5);
      });

      it('should return the provided default if there is nothing', function () {
        var maybe = M.Maybe.of(null);

        should(maybe.getOrElse(7)).be.exactly(7);
      });
    });

    describe('map', function () {
      var partOfDayFromJson = _(PartOfDay).reviver.bind(undefined, '');

      it('should apply a function f to the value and return another Maybe with it', function () {
        var maybeFrom1 = M.Maybe.of(5);
        var maybeFrom2 = M.Maybe.of('EVENING');

        var maybeTo1 = maybeFrom1.map(function (x) {
          return 2 * x;
        });
        var maybeTo2 = maybeFrom2.map(partOfDayFromJson);

        should(maybeTo1.getOrElse(0)).be.exactly(10);
        should(maybeTo2.getOrElse(PartOfDay.MORNING())).be.exactly(PartOfDay.EVENING());
      });

      it('should return a non-empty Maybe of whatever mapped function returns', function () {
        var maybeFrom1 = M.Maybe.of(null);
        var maybeFrom2 = M.Maybe.of(0);

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

        should(M.Maybe.of(10).map(doublePlus5).inner().get()).be.exactly(M.Maybe.of(10).map(double).map(plus5).inner().get()).and.exactly(25);

        should(M.Maybe.of(10).map(function (x) {
          return null;
        }).map(plus5).inner().get()).be.exactly(5);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMaybe1 = M.Maybe.of(2);
        var modelicoMaybe2 = M.Maybe.of(2);

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
      });

      it('supports non-primitive types', function () {
        var modelicoMaybe1 = M.Maybe.of(M.Number.of(2));
        var modelicoMaybe2 = M.Maybe.of(M.Number.of(2));

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe1).should.be.exactly(true);
        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(true);
        modelicoMaybe1.equals(null).should.be.exactly(false);
        modelicoMaybe1.equals().should.be.exactly(false);
      });

      it('handles nothing well', function () {
        var modelicoMaybe1 = M.Maybe.of(M.Number.of(2));
        var modelicoMaybe2 = M.Maybe.EMPTY;
        var modelicoMaybe3 = M.Maybe.of();

        modelicoMaybe1.should.not.be.exactly(modelicoMaybe2);
        modelicoMaybe1.should.not.equal(modelicoMaybe2);

        modelicoMaybe1.equals(modelicoMaybe2).should.be.exactly(false);
        modelicoMaybe2.equals(modelicoMaybe3).should.be.exactly(true);
      });

      it('should have Object.is semantics', function () {
        M.Maybe.of(0).equals(M.Maybe.of(-0)).should.be.exactly(false);
        M.Maybe.of(NaN).equals(M.Maybe.of(NaN)).should.be.exactly(true);
      });
    });
  };
});

/* eslint-env mocha */

var asIs = (function (U, should, M) {
  return function () {
    var _M$metadata = M.metadata,
        asIs = _M$metadata.asIs,
        any = _M$metadata.any,
        fn = _M$metadata.fn,
        regExp = _M$metadata.regExp,
        string = _M$metadata.string;


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

      it('should support non-trivial native constructors: Function', function () {
        var asIsObject = JSON.parse('"return (function(x) { return x * 4 })(arguments[0])"', fn().reviver);

        should(asIsObject(5)).be.exactly(20);
      });

      it('should support non-trivial native constructors: RegExp', function () {
        var asIsObject = JSON.parse('"^[a-z]+$"', regExp().reviver);

        asIsObject.test('abc').should.be.exactly(true);
        asIsObject.test('abc1').should.be.exactly(false);
        asIsObject.test('Abc').should.be.exactly(false);
      });

      it('should support any function', function () {
        var asIsObject = JSON.parse('9', asIs(function (x) {
          return x * 2;
        }).reviver);

        should(asIsObject).be.exactly(18);
      });
    });

    describe('metadata', function () {
      it('should return metadata like type', function () {
        string().type.should.be.exactly(String);

        var asIsObject = JSON.parse('{"two":2}', any().reviver);

        should(asIsObject.two).be.exactly(2);
      });

      U.skipIfNoObjectFreeze('should be immutable', function () {
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

var setPath = (function (should, M) {
  return function () {
    it('should work across types', function () {
      var hammer = M.Map.of('hammer', 'Can’t Touch This');
      var array1 = M.List.of('totally', 'immutable', hammer);

      array1.inner()[1] = 'I’m going to mutate you!';
      array1.inner()[1].should.be.exactly('immutable');

      array1.setPath([2, 'hammer'], 'hm, surely I can mutate this nested object...');

      array1.inner()[2].inner().get('hammer').should.be.exactly('Can’t Touch This');
    });

    it('should work across types (2)', function () {
      var list = M.List.of('totally', 'immutable');
      var hammer1 = M.Map.fromObject({ hammer: 'Can’t Touch This', list: list });

      hammer1.inner().set('hammer', 'I’m going to mutate you!');
      hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setPath(['list', 1], 'hm, surely I can mutate this nested object...');

      hammer1.inner().get('list').inner()[1].should.be.exactly('immutable');
    });
  };
});

/* eslint-env mocha */

var featuresSimple = (function (should, M) {
  return function () {
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        string = _M$metadata.string;

    var Animal = function (_M$Base) {
      inherits(Animal, _M$Base);

      function Animal(fields) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
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
    var _M$metadata = M.metadata,
        _ = _M$metadata._,
        any = _M$metadata.any,
        maybe = _M$metadata.maybe,
        list = _M$metadata.list,
        string = _M$metadata.string;

    var Animal = function (_M$Base) {
      inherits(Animal, _M$Base);

      function Animal(fields) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
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

      function Person(fields) {
        classCallCheck(this, Person);
        return possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).call(this, Person, fields));
      }

      createClass(Person, [{
        key: 'fullName',
        value: function fullName() {
          var fields = M.fields(this);
          return [fields.givenName, fields.familyName].join(' ').trim();
        }
      }], [{
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            givenName: any(),
            middleName: maybe(any()),
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

      var defaultAnimal = new Animal({});

      person1.pets().inner().shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      person1.pets().inner().shift().getOrElse(defaultAnimal).speak().should.be.exactly('My name is Robbie!');

      var person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

      person3.pets().inner()[0].getOrElse(defaultAnimal).name().getOrElse('').should.be.exactly('Bane');

      person1.pets().inner()[0].getOrElse(defaultAnimal).name().getOrElse('').should.be.exactly('Robbie');
    });
  };
});

/* eslint-env mocha */

var featuresAdvancedES5 = (function (should, M) {
  return function () {
    // use ES5 below
    var m = M.metadata;

    function Animal(fields) {
      M.Base.factory(Animal, fields, this);
    }

    Animal.prototype = Object.create(M.Base.prototype);

    Animal.prototype.speak = function () {
      var name = this.name();
      return name === '' ? "I don't have a name" : 'My name is ' + name + '!';
    };

    Animal.innerTypes = function () {
      return Object.freeze({
        name: m.string()
      });
    };

    function Person(fields) {
      M.Base.factory(Person, fields, this);
    }

    Person.prototype = Object.create(M.Base.prototype);

    Person.prototype.fullName = function () {
      return [this.givenName(), this.familyName()].join(' ').trim();
    };

    Person.innerTypes = function () {
      return Object.freeze({
        givenName: m.string(),
        familyName: m.string(),
        pets: m.list(m._(Animal))
      });
    };

    // use > ES5 below
    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person1 = JSON.parse(personJson, m._(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');
    });
  };
});

/* eslint-env mocha */

var CountryFactory = (function (M, Region) {
  var _M$metadata = M.metadata,
      _ = _M$metadata._,
      string = _M$metadata.string;

  var Country = function (_M$Base) {
    inherits(Country, _M$Base);

    function Country(fields) {
      var _ret;

      classCallCheck(this, Country);

      var _this = possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(Country, null, [{
      key: "innerTypes",
      value: function innerTypes(depth) {
        return Object.freeze({
          name: string(),
          code: string(),
          region: _(Region, depth)
        });
      }
    }]);
    return Country;
  }(M.Base);

  return Object.freeze(Country);
});

/* eslint-env mocha */

var CityFactory = (function (M, Region) {
  var Country = CountryFactory(M, Region);
  var _M$metadata = M.metadata,
      _ = _M$metadata._,
      string = _M$metadata.string;

  var City = function (_M$Base) {
    inherits(City, _M$Base);

    function City(fields) {
      var _ret;

      classCallCheck(this, City);

      var _this = possibleConstructorReturn(this, (City.__proto__ || Object.getPrototypeOf(City)).call(this, City, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(City, null, [{
      key: 'innerTypes',
      value: function innerTypes(depth) {
        return Object.freeze({
          name: string(),
          country: _(Country, depth)
        });
      }
    }]);
    return City;
  }(M.Base);

  return Object.freeze(City);
});

/* eslint-env mocha */

var RegionFactory = (function (M) {
  var string = M.metadata.string;

  var Region = function (_M$Base) {
    inherits(Region, _M$Base);

    function Region(fields) {
      var _ret;

      classCallCheck(this, Region);

      var _this = possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
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

var RegionIncompatibleNameKeyFactory = (function (M) {
  var _M$metadata = M.metadata,
      _ = _M$metadata._,
      number = _M$metadata.number,
      string = _M$metadata.string;

  var Code = function (_M$Base) {
    inherits(Code, _M$Base);

    function Code(fields) {
      var _ret;

      classCallCheck(this, Code);

      var _this = possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).call(this, Code, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
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

    function Region(fields) {
      var _ret2;

      classCallCheck(this, Region);

      var _this2 = possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, fields));

      return _ret2 = Object.freeze(_this2), possibleConstructorReturn(_this2, _ret2);
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

/* eslint-env mocha */

var featuresDeepNesting = (function (should, M) {
  return function () {
    var _ = M.metadata._;


    it('should revive deeply nested JSON', function () {
      var City = CityFactory(M, RegionFactory(M));
      var cityJson = '{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}';

      var city = JSON.parse(cityJson, _(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().code().should.be.exactly('ESP');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });

    it('should support nested keys with different types', function () {
      var City = CityFactory(M, RegionIncompatibleNameKeyFactory(M));
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

var Immutable = (function (U, should, M) {
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

      var list2Array = list1.inner();
      list2Array.push(3, 4, 5);
      var list2 = M.List.fromArray(list2Array);

      var list3Array = list2.inner();
      list3Array.unshift(0);
      var list3 = M.List.fromArray(list3Array);

      var list4 = M.List.fromArray(list1.inner().concat(list2.inner(), list3.inner()));

      (list1.inner().length === 2).should.be.exactly(true);
      (list2.inner().length === 5).should.be.exactly(true);
      (list3.inner().length === 6).should.be.exactly(true);
      (list4.inner().length === 13).should.be.exactly(true);
      (list4.inner()[0] === 1).should.be.exactly(true);
    });

    it('JavaScript-first API (2)', function () {
      var alpha = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      [].concat(toConsumableArray(alpha.inner())).map(function (kv) {
        return kv[0].toUpperCase();
      }).join().should.be.exactly('A,B,C,D');
    });

    it('Accepts raw JavaScript objects.', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      var map2 = M.Map.fromObject({ c: 10, a: 20, t: 30 });

      var obj = { d: 100, o: 200, g: 300 };

      var map3 = M.Map.fromMap(new Map([].concat([].concat(toConsumableArray(map1.inner())), [].concat(toConsumableArray(map2.inner())), objToArr(obj))));

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
      var map2 = M.Map.fromObject({ a: 1, b: 1, c: 1 });

      (map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = M.List.of(1, 2, 3);
      var list2Array = list1.inner();
      list2Array.push(4, 5, 6);
      var list2 = M.List.fromArray(list2Array);

      (list1.inner().length === 3).should.be.exactly(true);
      (list2.inner().length === 6).should.be.exactly(true);
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
      var list4 = list1.concat([].concat(toConsumableArray(list2)), [].concat(toConsumableArray(list3)));

      (list1.length === 2).should.be.exactly(true);
      (list2.length === 5).should.be.exactly(true);
      (list3.length === 6).should.be.exactly(true);
      (list4.length === 13).should.be.exactly(true);
      (list4[0] === 1).should.be.exactly(true);
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
      var map2 = _m(M.Map.fromObject({ a: 1, b: 1, c: 1 }));

      (map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = _l(M.List.of(1, 2, 3));

      var res = list1.inner();
      res.push(4);
      res.push(5);
      res.push(6);
      var list2 = _l(M.List.fromArray(res));

      (list1.length === 3).should.be.exactly(true);
      (list2.length === 6).should.be.exactly(true);
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
      var list1 = p(M.List.of(1, 2, 2, 3));

      list1.length.should.be.exactly(4);
    });

    it('[n]', function () {
      var list1 = p(M.List.of(1, 2, 2, 3));

      list1[0].should.be.exactly(1);
      list1[1].should.be.exactly(2);
      list1[2].should.be.exactly(2);
      list1[3].should.be.exactly(3);

      should(list1[4]).be.exactly(undefined);

      list1['0'].should.be.exactly(1);
      list1['1'].should.be.exactly(2);
      list1['2'].should.be.exactly(2);
      list1['3'].should.be.exactly(3);

      should(list1['4']).be.exactly(undefined);
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
      });

      sum.should.be.exactly(8);
    });

    it('keys() / entries() / [@@iterator]()', function () {
      var list = p(M.List.of(1, 2, 2, 3));

      [].concat(toConsumableArray(list.entries())).should.eql([[0, 1], [1, 2], [2, 2], [3, 3]]);

      [].concat(toConsumableArray(list.keys())).should.eql([0, 1, 2, 3]);

      [].concat(toConsumableArray(list[Symbol.iterator]())).should.eql([1, 2, 2, 3]);
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

      list.sort().toJSON().should.eql([1, 2, 3, 4, 5]);

      list.sort().toJSON().should.eql([1, 2, 3, 4, 5]);
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
    var string = M.metadata.string;

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

var hasObjectFreeze = function () {
  var a = {};

  try {
    Object.freeze(a);
  } catch (e) {
    return false;
  }

  try {
    a.test = 1;
    return false;
  } catch (ignore) {}

  return true;
}();

var hasProxies = function () {
  try {
    return new Proxy({}, {}) && true;
  } catch (ignore) {}

  return false;
}();

var buildUtils = function buildUtils(options) {
  return Object.freeze({
    skipIfNoProxies: hasProxies ? it : it.skip,
    skipDescribeIfNoProxies: hasProxies ? describe : describe.skip,
    skipIfNoObjectFreeze: hasObjectFreeze ? it : it.skip,
    objToArr: function objToArr(obj) {
      return Object.keys(obj).map(function (k) {
        return [k, obj[k]];
      });
    }
  });
};

var modelicoSpec = (function (options, should, M) {
  return function () {
    var U = buildUtils(options);
    var deps = [should, M];
    var utilsAndDeps = [U].concat(deps);

    describe('Base', Base.apply(undefined, toConsumableArray(utilsAndDeps)));
    describe('Number', ModelicoNumber.apply(undefined, deps));
    describe('Date', ModelicoDate.apply(undefined, deps));
    describe('Map', ModelicoMap.apply(undefined, deps));
    describe('Enum', ModelicoEnum.apply(undefined, deps));
    describe('EnumMap', ModelicoEnumMap.apply(undefined, deps));
    describe('ModelicoList', ModelicoList.apply(undefined, deps));
    describe('ModelicoSet', ModelicoSet.apply(undefined, deps));
    describe('ModelicoMaybe', ModelicoMaybe.apply(undefined, deps));

    describe('asIs', asIs.apply(undefined, toConsumableArray(utilsAndDeps)));
    describe('setPath', setPath.apply(undefined, deps));

    describe('Readme simple features', featuresSimple.apply(undefined, deps));
    describe('Readme advanced features', featuresAdvanced.apply(undefined, deps));
    describe('Readme advanced features ES5', featuresAdvancedES5.apply(undefined, deps));
    describe('Deep nesting features', featuresDeepNesting.apply(undefined, deps));
    describe('Immutable.js examples', Immutable.apply(undefined, toConsumableArray(utilsAndDeps)));

    U.skipDescribeIfNoProxies('Immutable.js examples (proxied)', ImmutableProxied.apply(undefined, toConsumableArray(utilsAndDeps)));

    U.skipDescribeIfNoProxies('Proxies', function () {
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
