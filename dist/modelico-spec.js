(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.modelicoSpec = factory());
}(this, (function () { 'use strict';

var range = function range(minTime, maxTime) {
  return { minTime: minTime, maxTime: maxTime };
};

var PartOfDayFactory = (function (M) {
  return new M.Enum({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
});

var SexFactory = (function (M) {
  return new M.Enum(['FEMALE', 'MALE', 'OTHER']);
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

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var PersonFactory = (function (M) {
  var PartOfDay = PartOfDayFactory(M);
  var Sex = SexFactory(M);

  var Modelico = M.Modelico;
  var joinWithSpace = function joinWithSpace() {
    for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
      parts[_key] = arguments[_key];
    }

    return parts.filter(function (x) {
      return x !== null && x !== undefined;
    }).join(' ');
  };

  var Person = function (_Modelico) {
    inherits(Person, _Modelico);

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
          givenName: M.AsIs(String),
          familyName: M.AsIs(String),
          birthday: M.Date.metadata(),
          favouritePartOfDay: PartOfDay.metadata(),
          lifeEvents: M.Map.metadata(String, M.Date.metadata()),
          importantDatesList: M.List.metadata(M.Date.metadata()),
          importantDatesSet: M.Set.metadata(M.Date.metadata()),
          sex: Sex.metadata()
        });
      }
    }, {
      key: 'metadata',
      value: function metadata() {
        return Modelico.metadata(Person);
      }
    }]);
    return Person;
  }(Modelico);

  return Object.freeze(Person);
});

var AnimalFactory = (function (M) {
  var Modelico = M.Modelico;

  var Animal = function (_Modelico) {
    inherits(Animal, _Modelico);

    function Animal(fields) {
      classCallCheck(this, Animal);
      return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
    }

    createClass(Animal, [{
      key: 'speak',
      value: function speak() {
        return 'hello';
      }
    }]);
    return Animal;
  }(Modelico);

  return Object.freeze(Animal);
});

var Modelico = (function (should, M) {
  return function () {
    var Person = PersonFactory(M);
    var PartOfDay = PartOfDayFactory(M);
    var Sex = SexFactory(M);
    var Animal = AnimalFactory(M);

    var Modelico = M.Modelico;
    var ModelicoDate = M.Date;

    var author1Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","sex":"MALE"}';
    var author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

    describe('setting', function () {
      it('should set fields returning a new object', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
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
          sex: Sex.MALE()
        });

        var author2 = author1.setPath(['givenName'], 'Javi').setPath(['birthday', 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(author2.birthday().inner().getFullYear()).be.exactly(1989);

        // verify that the original author1 was not mutated
        should(author1.birthday().inner().getFullYear()).be.exactly(1988);
      });

      it('edge case when Modelico setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);
        var listOfPeople1 = new M.List(Person.metadata(), [author]);

        var listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
        var listOfPeople3 = listOfPeople2.setPath([0], M.fields(author));

        listOfPeople1.inner()[0].givenName().should.be.exactly('Javier');
        listOfPeople2.inner()[0].givenName().should.be.exactly('Javi');
        listOfPeople3.inner()[0].givenName().should.be.exactly('Javier');
      });
    });

    describe('stringifying', function () {
      it('should stringify types correctly', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        JSON.stringify(author1).should.be.exactly(author1Json);
      });

      it('should support null in Enum', function () {
        var author2 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: null,
          sex: Sex.MALE()
        });

        JSON.stringify(author2).should.be.exactly(author2Json);
      });
    });

    describe('parsing', function () {
      it('should parse types correctly', function () {
        var author1 = Modelico.fromJSON(Person, author1Json);
        var author2 = JSON.parse(author1Json, Modelico.metadata(Person).reviver);

        'Javier Cejudo'.should.be.exactly(author1.fullName()).and.exactly(author2.fullName());

        should(1988).be.exactly(author1.birthday().inner().getFullYear()).and.exactly(author2.birthday().inner().getFullYear());

        should(PartOfDay.EVENING().minTime).be.exactly(author1.favouritePartOfDay().minTime).and.exactly(author2.favouritePartOfDay().minTime);

        Sex.MALE().code.should.be.exactly(author1.sex().code).and.exactly(author2.sex().code);
      });

      it('should support null in Enum', function () {
        var author2 = Modelico.fromJSON(Person, author2Json);

        (author2.favouritePartOfDay() === null).should.be.exactly(true);
      });

      it('should work with plain classes extending Modelico', function () {
        var animal = JSON.parse('{"name": "Sam"}', Modelico.metadata(Animal).reviver);

        animal.speak().should.be.exactly('hello');
        animal.name().should.be.exactly('Sam');
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var author1 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        var author2 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        var author3 = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo Goñi',
          birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        author1.equals(author2).should.be.exactly(true);
        author1.equals(author3).should.be.exactly(false);

        author1.should.not.be.exactly(author2);
      });
    });

    describe('fields', function () {
      it('creates an accessor method for every field and every inner type declared', function () {
        var author = new Person({
          undeclaredField: 'something'
        });

        author.undeclaredField().should.be.exactly('something');
        should(author.givenName()).be.exactly(undefined);
      });
    });
  };
});

var ModelicoAsIs = (function (U, should, M) {
  return function () {
    var AsIs = M.AsIs;
    var List = M.List;

    describe('toJSON', function () {
      it('should stringify the value as is', function () {
        var mapOfNumbers = M.Map.fromObject({ a: 1, b: 2 });

        JSON.stringify(mapOfNumbers).should.be.exactly('[{"key":"a","value":1},{"key":"b","value":2}]');
      });
    });

    describe('reviver', function () {
      it('should revive the value as is, without the wrapper', function () {
        var asIsObject = JSON.parse('{"two":2}', AsIs(Object).reviver);

        should(asIsObject.two).be.exactly(2);
      });
    });

    describe('metadata', function () {
      it('should return metadata like type', function () {
        AsIs(String).type.should.be.exactly(String);

        var asIsObject = JSON.parse('{"two":2}', AsIs(Object).reviver);

        should(asIsObject.two).be.exactly(2);
      });

      U.skipIfNoObjectFreeze('should be immutable', function () {
        (function () {
          return AsIs().reviver = function (x) {
            return x;
          };
        }).should.throw();
      });
    });
  };
});

var ModelicoMap = (function (should, M) {
  return function () {
    var Person = PersonFactory(M);
    var Modelico = M.Modelico;

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var map = M.Map.fromObject({ a: 1, b: 2, c: 3 });

        [].concat(toConsumableArray(map)).should.eql([['a', 1], ['b', 2], ['c', 3]]);
      });

      it('should set fields returning a new map', function () {
        var map = new Map([['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))], ['b', new M.Date(null)]]);

        var modelicoMap1 = new M.Map(M.AsIs(String), M.Date.metadata(), map);
        var modelicoMap2 = modelicoMap1.set('a', new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.inner().get('a').inner().getFullYear()).be.exactly(1989);

        // verify that modelicoMap1 was not mutated
        should(modelicoMap1.inner().get('a').inner().getFullYear()).be.exactly(1988);
      });

      it('should set fields returning a new map when part of a path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author1 = Modelico.fromJSON(Person, authorJson);
        var author2 = author1.setPath(['lifeEvents', 'wedding', 'date'], new Date('2013-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);

        // verify that author1 was not mutated
        should(author1.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);

        var map = author.lifeEvents();

        should(map.inner().get('wedding').inner().getFullYear()).be.exactly(2012);

        var customMap = new Map([['wedding', new M.Date(new Date('2013-03-28T00:00:00.000Z'))]]);

        var map2 = map.setPath([], customMap);

        should(map2.inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });
    });

    describe('stringifying', function () {
      it('should stringify the map correctly', function () {
        var map = new Map([['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))], ['b', new M.Date(null)]]);

        var modelicoMap = new M.Map(M.AsIs(String), M.Date.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
      });

      it('should support null maps', function () {
        var map = null;
        var modelicoMap = new M.Map(M.AsIs(String), M.Date.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the map correctly', function () {
        var modelicoMap = JSON.parse('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]', M.Map.metadata(M.AsIs(String), M.Date.metadata()).reviver);

        should(modelicoMap.inner().get('a').inner().getFullYear()).be.exactly(1988);

        should(modelicoMap.inner().get('b').inner()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);

        should(author.lifeEvents().inner().get('wedding').inner().getFullYear()).be.exactly(2013);
      });

      it('should support null maps', function () {
        var modelicoMap = JSON.parse('null', M.Map.metadata(M.AsIs(String), M.Date.metadata()).reviver);

        should(modelicoMap.inner()).be.exactly(null);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMap = new M.Map(M.AsIs(String), M.Date.metadata(), new Map([['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))]]));

        var modelicoMap2 = new M.Map(M.AsIs(String), M.Date.metadata(), new Map([['a', new M.Date(new Date('1988-04-16T00:00:00.000Z'))]]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap2).should.be.exactly(true);
      });
    });

    describe('from object', function () {
      it('should be able to create a set from an array', function () {
        var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });

        should(map1.inner().get('b')).be.exactly(2);
      });
    });

    describe('from map', function () {
      it('should be able to create a set from a native set', function () {
        var map1 = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

        should(map1.inner().get('b')).be.exactly(2);
      });
    });
  };
});

var ModelicoEnumMap = (function (should, M) {
  return function () {
    var PartOfDay = PartOfDayFactory(M);

    describe('setting', function () {
      it('should set fields returning a new enum map', function () {
        var map = new Map([[PartOfDay.MORNING(), 'Good morning!'], [PartOfDay.AFTERNOON(), 'Good afternoon!'], [PartOfDay.EVENING(), 'Good evening!']]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);
        var greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

        greetings2.inner().get(PartOfDay.AFTERNOON()).should.be.exactly('GOOD AFTERNOON!');

        greetings1.inner().get(PartOfDay.AFTERNOON()).should.be.exactly('Good afternoon!');
      });

      it('should set fields returning a new enum map when part of a path', function () {
        var map = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map);
        var greetings2 = greetings1.setPath([PartOfDay.EVENING(), 'date'], new Date('2013-04-16T00:00:00.000Z'));

        should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2013);

        should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', function () {
        var map1 = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]]);

        var map2 = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1989-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2001-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2013-04-16T00:00:00.000Z'))]]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map1);
        var greetings2 = greetings1.setPath([], map2);

        should(greetings2.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2013);

        should(greetings1.inner().get(PartOfDay.EVENING()).inner().getFullYear()).be.exactly(2012);
      });
    });

    describe('stringifying', function () {
      it('should stringify the enum map correctly', function () {
        var map = new Map([[PartOfDay.MORNING(), 'Good morning!'], [PartOfDay.AFTERNOON(), 'Good afternoon!'], [PartOfDay.EVENING(), 'Good evening!']]);

        var greetings = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);

        JSON.stringify(greetings).should.be.exactly('{"MORNING":"Good morning!","AFTERNOON":"Good afternoon!","EVENING":"Good evening!"}');
      });

      it('should support null enum maps', function () {
        var map = null;

        var greetings = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);

        JSON.stringify(greetings).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the enum map correctly', function () {
        var greetings = JSON.parse('{"MORNING":"Good morning!","AFTERNOON":1,"EVENING":[]}', M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(M.Any)).reviver);

        greetings.inner().get(PartOfDay.MORNING()).should.be.exactly('Good morning!');
      });

      it('should support null enum maps', function () {
        var greetings = JSON.parse('null', M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(String)).reviver);

        should(greetings.inner()).be.exactly(null);
      });
    });
  };
});

var ModelicoList = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;
    var Person = PersonFactory(M);

    describe('instantiation', function () {
      it('must be instantiated with new', function () {
        (function () {
          return M.List(M.AsIs(M.Any), []);
        }).should.throw();
      });
    });

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var list = M.List.fromArray([1, 2, 3, 4]);

        [].concat(toConsumableArray(list)).should.eql([1, 2, 3, 4]);
      });

      it('should set items in the list correctly', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path with a single element', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

        should(modelicoList2.inner()[0].inner().getFullYear()).be.exactly(2000);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.inner()[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole list', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        var newListArray = author1.importantDatesList().inner();
        newListArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesList', new M.List(M.Date.metadata(), newListArray));

        should(author1.importantDatesList().inner().length).be.exactly(2);
        should(author1.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
        should(author1.importantDatesList().inner()[1].inner().getFullYear()).be.exactly(2012);

        should(author2.importantDatesList().inner().length).be.exactly(3);
        should(author2.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
        should(author2.importantDatesList().inner()[1].inner().getFullYear()).be.exactly(2016);
        should(author2.importantDatesList().inner()[2].inner().getFullYear()).be.exactly(2012);
      });

      it('edge case when List setPath is called with an empty path', function () {
        var modelicoDatesList1 = new M.List(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)]);

        var modelicoDatesList2 = [new M.Date(new Date('2016-04-16T00:00:00.000Z'))];

        var listOfListOfDates1 = new M.List(M.List.metadata(M.Date.metadata()), [modelicoDatesList1]);
        var listOfListOfDates2 = listOfListOfDates1.setPath([0], modelicoDatesList2);

        should(listOfListOfDates1.inner()[0].inner()[0].inner().getFullYear()).be.exactly(1988);

        should(listOfListOfDates2.inner()[0].inner()[0].inner().getFullYear()).be.exactly(2016);
      });
    });

    describe('stringifying', function () {
      it('should stringify the list correctly', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList = new M.List(M.Date.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null lists', function () {
        var list = null;
        var modelicoList = new M.List(M.Date.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the list correctly', function () {
        var modelicoList = JSON.parse('["1988-04-16T00:00:00.000Z",null]', M.List.metadata(M.Date.metadata()).reviver);

        should(modelicoList.inner()[0].inner().getFullYear()).be.exactly(1988);

        should(modelicoList.inner()[1].inner()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should(author.importantDatesList().inner()[0].inner().getFullYear()).be.exactly(2013);
      });

      it('should support null lists', function () {
        var modelicoList = JSON.parse('null', M.List.metadata(M.Date.metadata()).reviver);

        should(modelicoList.inner()).be.exactly(null);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoList1 = new M.List(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z'))]);

        var modelicoList2 = new M.List(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z'))]);

        modelicoList1.should.not.be.exactly(modelicoList2);
        modelicoList1.should.not.equal(modelicoList2);

        modelicoList1.equals(modelicoList2).should.be.exactly(true);
      });
    });

    describe('from array', function () {
      it('should be able to create a list from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoList = M.List.fromArray(fibArray);

        modelicoList.inner().should.eql([0, 1, 1, 2, 3, 5, 8]);
      });
    });
  };
});

var ModelicoSet = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;
    var Person = PersonFactory(M);

    describe('setting', function () {
      it('should implement Symbol.iterator', function () {
        var set = M.Set.fromArray([1, 2, 2, 4]);

        [].concat(toConsumableArray(set)).should.eql([1, 2, 4]);
      });

      it('should set items in the set correctly', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should([].concat(toConsumableArray(modelicoSet2.inner()))[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should([].concat(toConsumableArray(modelicoSet1.inner()))[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should([].concat(toConsumableArray(modelicoSet2.inner()))[0].inner().getFullYear()).be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should([].concat(toConsumableArray(modelicoSet1.inner()))[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path with a single element', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.setPath([0], new Date('2000-04-16T00:00:00.000Z'));

        should([].concat(toConsumableArray(modelicoSet2.inner()))[0].inner().getFullYear()).be.exactly(2000);

        // verify that modelicoSet1 was not mutated
        should([].concat(toConsumableArray(modelicoSet1.inner()))[0].inner().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole set', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        var newSetArray = [].concat(toConsumableArray(author1.importantDatesSet().inner()));
        newSetArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesSet', new M.Set(M.Date.metadata(), newSetArray));

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
        var modelicoDatesSet1 = new M.Set(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)]);

        var modelicoDateSet2 = new Set([new M.Date(new Date('2016-04-16T00:00:00.000Z'))]);

        var setOfSetsOfDates1 = new M.Set(M.Set.metadata(M.Date.metadata()), [modelicoDatesSet1]);
        var setOfSetsOfDates2 = setOfSetsOfDates1.setPath([0], modelicoDateSet2);

        should([].concat(toConsumableArray([].concat(toConsumableArray(setOfSetsOfDates1.inner()))[0].inner()))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray([].concat(toConsumableArray(setOfSetsOfDates2.inner()))[0].inner()))[0].inner().getFullYear()).be.exactly(2016);
      });
    });

    describe('stringifying', function () {
      it('should stringify the set correctly', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet = new M.Set(M.Date.metadata(), set);

        JSON.stringify(modelicoSet).should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null sets', function () {
        var set = null;
        var modelicoSet = new M.Set(M.Date.metadata(), set);

        JSON.stringify(modelicoSet).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the set correctly', function () {
        var modelicoSet = JSON.parse('["1988-04-16T00:00:00.000Z",null]', M.Set.metadata(M.Date.metadata()).reviver);

        should([].concat(toConsumableArray(modelicoSet.inner()))[0].inner().getFullYear()).be.exactly(1988);

        should([].concat(toConsumableArray(modelicoSet.inner()))[1].inner()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should([].concat(toConsumableArray(author.importantDatesSet().inner()))[0].inner().getFullYear()).be.exactly(2013);
      });

      it('should support null sets', function () {
        var modelicoSet = JSON.parse('null', M.Set.metadata(M.Date.metadata()).reviver);

        should(modelicoSet.inner()).be.exactly(null);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoSet1 = new M.Set(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z'))]);

        var modelicoSet2 = new M.Set(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z'))]);

        modelicoSet1.should.not.be.exactly(modelicoSet2);
        modelicoSet1.should.not.equal(modelicoSet2);

        modelicoSet1.equals(modelicoSet2).should.be.exactly(true);
      });
    });

    describe('from array', function () {
      it('should be able to create a set from an array', function () {
        var fibArray = [0, 1, 1, 2, 3, 5, 8];

        var modelicoSet = M.Set.fromArray(fibArray);

        [].concat(toConsumableArray(modelicoSet.inner())).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });

    describe('from set', function () {
      it('should be able to create a set from a native set', function () {
        var fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

        var modelicoSet = M.Set.fromSet(fibSet);

        [].concat(toConsumableArray(modelicoSet.inner())).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });
  };
});

var setPath = (function (should, M) {
  return function () {

    it('should work across types', function () {
      var hammer = M.Map.fromObject({ hammer: 'Can’t Touch This' });
      var array1 = M.List.fromArray(['totally', 'immutable', hammer]);

      array1.inner()[1] = 'I’m going to mutate you!';
      array1.inner()[1].should.be.exactly('immutable');

      array1.setPath([2, 'hammer'], 'hm, surely I can mutate this nested object...');

      array1.inner()[2].inner().get('hammer').should.be.exactly('Can’t Touch This');
    });

    it('should work across types (2)', function () {
      var list = M.List.fromArray(['totally', 'immutable']);
      var hammer1 = M.Map.fromObject({ hammer: 'Can’t Touch This', list: list });

      hammer1.inner().set('hammer', 'I’m going to mutate you!');
      hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setPath(['list', 1], 'hm, surely I can mutate this nested object...');

      hammer1.inner().get('list').inner()[1].should.be.exactly('immutable');
    });

    it('should work across types (3)', function () {
      var mySet = M.Set.fromArray(['totally', 'immutable']);
      var hammer1 = M.Map.fromObject({ hammer: 'Can’t Touch This', mySet: mySet });

      hammer1.inner().set('hammer', 'I’m going to mutate you!');
      hammer1.inner().get('hammer').should.be.exactly('Can’t Touch This');

      hammer1.setPath(['mySet', 1], 'hm, surely I can mutate this nested object...');

      hammer1.inner().get('mySet').inner().has('immutable').should.be.exactly(true);
    });
  };
});

var featuresSimple = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;

    var Animal = function (_Modelico) {
      inherits(Animal, _Modelico);

      function Animal(fields) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
      }

      createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = M.fields(this).name;
          return name === undefined ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }]);
      return Animal;
    }(Modelico);

    it('should showcase the main features', function () {
      var petJson = '{"name": "Robbie"}';

      var pet1 = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

      pet1.speak().should.be.exactly('My name is Robbie!');

      var pet2 = pet1.set('name', 'Bane');

      pet2.name().should.be.exactly('Bane');
      pet1.name().should.be.exactly('Robbie');
    });
  };
});

var featuresAdvanced = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;

    var Animal = function (_Modelico) {
      inherits(Animal, _Modelico);

      function Animal(fields) {
        classCallCheck(this, Animal);
        return possibleConstructorReturn(this, (Animal.__proto__ || Object.getPrototypeOf(Animal)).call(this, Animal, fields));
      }

      createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = M.fields(this).name;
          return name === undefined ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }]);
      return Animal;
    }(Modelico);

    var Person = function (_Modelico2) {
      inherits(Person, _Modelico2);

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
            givenName: M.AsIs(M.Any),
            familyName: M.AsIs(String),
            pets: M.List.metadata(Modelico.metadata(Animal))
          });
        }
      }]);
      return Person;
    }(Modelico);

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');

      var person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

      person3.pets().inner()[0].name().should.be.exactly('Bane');

      person1.pets().inner()[0].name().should.be.exactly('Robbie');
    });
  };
});

var featuresAdvancedES5 = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;

    function Animal(fields) {
      Modelico.factory(Animal, fields, this);
    }

    Animal.prototype = Object.create(Modelico.prototype);

    Animal.prototype.speak = function () {
      var name = M.fields(this).name;
      return name === undefined ? "I don't have a name" : 'My name is ' + name + '!';
    };

    function Person(fields) {
      Modelico.factory(Person, fields, this);
    }

    Person.prototype = Object.create(Modelico.prototype);

    Person.prototype.fullName = function () {
      var fields = M.fields(this);
      return [fields.givenName, fields.familyName].join(' ').trim();
    };

    Person.innerTypes = function () {
      return Object.freeze({
        givenName: M.AsIs(String),
        familyName: M.AsIs(String),
        pets: M.List.metadata(Modelico.metadata(Animal))
      });
    };

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');

      person1.pets().inner().shift().speak().should.be.exactly('My name is Robbie!');
    });
  };
});

var CountryFactory = (function (M, Region) {
  var Modelico = M.Modelico;

  var Country = function (_Modelico) {
    inherits(Country, _Modelico);

    function Country(fields) {
      var _ret;

      classCallCheck(this, Country);

      var _this = possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(Country, null, [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: M.AsIs(String),
          code: M.AsIs(String),
          region: Modelico.metadata(Region)
        });
      }
    }]);
    return Country;
  }(Modelico);

  return Object.freeze(Country);
});

var CityFactory = (function (M, Region) {
  var Modelico = M.Modelico;
  var Country = CountryFactory(M, Region);

  var City = function (_Modelico) {
    inherits(City, _Modelico);

    function City(fields) {
      var _ret;

      classCallCheck(this, City);

      var _this = possibleConstructorReturn(this, (City.__proto__ || Object.getPrototypeOf(City)).call(this, City, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(City, null, [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: M.AsIs(String),
          country: Modelico.metadata(Country)
        });
      }
    }]);
    return City;
  }(Modelico);

  return Object.freeze(City);
});

var RegionFactory = (function (M) {
  var Modelico = M.Modelico;

  var Region = function (_Modelico) {
    inherits(Region, _Modelico);

    function Region(fields) {
      var _ret;

      classCallCheck(this, Region);

      var _this = possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(Region, [{
      key: 'customMethod',
      value: function customMethod() {
        return this.name() + ' (' + this.code() + ')';
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: M.AsIs(String),
          code: M.AsIs(String)
        });
      }
    }]);
    return Region;
  }(Modelico);

  return Object.freeze(Region);
});

var RegionIncompatibleNameKeyFactory = (function (M) {
  var Modelico = M.Modelico;

  var Code = function (_Modelico) {
    inherits(Code, _Modelico);

    function Code(fields) {
      var _ret;

      classCallCheck(this, Code);

      var _this = possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).call(this, Code, fields));

      return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
    }

    createClass(Code, null, [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          id: M.AsIs(Number),
          value: M.AsIs(String)
        });
      }
    }]);
    return Code;
  }(Modelico);

  var Region = function (_Modelico2) {
    inherits(Region, _Modelico2);

    function Region(fields) {
      var _ret2;

      classCallCheck(this, Region);

      var _this2 = possibleConstructorReturn(this, (Region.__proto__ || Object.getPrototypeOf(Region)).call(this, Region, fields));

      return _ret2 = Object.freeze(_this2), possibleConstructorReturn(_this2, _ret2);
    }

    createClass(Region, [{
      key: 'customMethod',
      value: function customMethod() {
        return this.name() + ' (' + this.code().value() + ')';
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes() {
        return Object.freeze({
          name: M.AsIs(String),
          code: Modelico.metadata(Code)
        });
      }
    }]);
    return Region;
  }(Modelico);

  return Object.freeze(Region);
});

var featuresDeepNesting = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;

    it('should revive deeply nested JSON', function () {
      var City = CityFactory(M, RegionFactory(M));
      var cityJson = '{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":"EU"}}}';

      var city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().code().should.be.exactly('ESP');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });

    it('should support nested keys with different types', function () {
      var City = CityFactory(M, RegionIncompatibleNameKeyFactory(M));
      var cityJson = '{"name":"Pamplona","country":{"name":"Spain","code":"ESP","region":{"name":"Europe","code":{"id": 1,"value":"EU"}}}}';

      var city = JSON.parse(cityJson, Modelico.metadata(City).reviver);

      city.name().should.be.exactly('Pamplona');
      city.country().name().should.be.exactly('Spain');
      city.country().code().should.be.exactly('ESP');
      city.country().region().customMethod().should.be.exactly('Europe (EU)');
    });
  };
});

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
      var list1 = M.List.fromArray([1, 2]);

      var list2Array = list1.inner();
      list2Array.push(3, 4, 5);
      var list2 = M.List.fromArray(list2Array);

      var list3Array = list2.inner();
      list3Array.unshift(0);
      var list3 = M.List.fromArray(list3Array);

      var list4Array = list1.inner();
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
      var obj = { 1: "one" };
      Object.keys(obj)[0].should.be.exactly('1');
      obj["1"].should.be.exactly('one');
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
      var list1 = M.List.fromArray([1, 2, 3]);
      var list2Array = list1.inner();
      list2Array.push(4, 5, 6);
      var list2 = M.List.fromArray(list2Array);

      (list1.inner().length === 3).should.be.exactly(true);
      (list2.inner().length === 6).should.be.exactly(true);
    });
  };
});

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
      var list1 = _l(M.List.fromArray([1, 2]));

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
        return res[k] = v * v;
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
      var list1 = _l(M.List.fromArray([1, 2, 3]));

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

var proxyList = (function (should, M) {
  return function () {
    var p = M.proxyList;

    it('length', function () {
      var list1 = p(M.List.fromArray([1, 2, 2, 3]));

      list1.length.should.be.exactly(4);
    });

    it('[n]', function () {
      var list1 = p(M.List.fromArray([1, 2, 2, 3]));

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
      var list = p(M.List.fromArray([1, 2, 3]));

      list.includes(2).should.be.exactly(true);

      list.includes(4).should.be.exactly(false);

      list.includes(3, 3).should.be.exactly(false);

      list.includes(3, -1).should.be.exactly(true);

      p(M.List.fromArray([1, 2, NaN])).includes(NaN).should.be.exactly(true);
    });

    it('join()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      list.join('-').should.be.exactly('1-2-2-3');
    });

    it('indexOf()', function () {
      var list = p(M.List.fromArray([2, 9, 9]));

      list.indexOf(2).should.be.exactly(0);

      list.indexOf(7).should.be.exactly(-1);

      list.indexOf(9, 2).should.be.exactly(2);

      list.indexOf(9).should.be.exactly(1);

      list.indexOf(2, -1).should.be.exactly(-1);

      list.indexOf(2, -3).should.be.exactly(0);
    });

    it('lastIndexOf()', function () {
      var list = p(M.List.fromArray([2, 5, 9, 2]));

      list.lastIndexOf(2).should.be.exactly(3);

      list.lastIndexOf(7).should.be.exactly(-1);

      list.lastIndexOf(2, 3).should.be.exactly(3);

      list.lastIndexOf(2, 2).should.be.exactly(0);

      list.lastIndexOf(2, -2).should.be.exactly(0);

      list.lastIndexOf(2, -1).should.be.exactly(3);
    });

    it('concat()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      list.concat(100).toJSON().should.eql([1, 2, 2, 3, 100]);

      list.concat([100, 200]).toJSON().should.eql([1, 2, 2, 3, 100, 200]);
    });

    it('slice()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      list.slice(1).toJSON().should.eql([2, 2, 3]);

      list.slice(2).set(0, 100).toJSON().should.eql([100, 3]);

      list.slice(2).toJSON().should.eql([2, 3]);

      list.slice(-3).toJSON().should.eql([2, 2, 3]);

      list.slice(0, -2).toJSON().should.eql([1, 2]);
    });

    it('filter()', function () {
      var list = p(M.List.fromArray([1, 2, 3]));

      list.filter(function (x) {
        return x % 2 === 1;
      }).toJSON().should.eql([1, 3]);
    });

    it('forEach()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      var sum = 0;
      list.forEach(function (x) {
        return sum += x;
      });

      sum.should.be.exactly(8);
    });

    it('keys() / entries() / [@@iterator]()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      [].concat(toConsumableArray(list.entries())).should.eql([[0, 1], [1, 2], [2, 2], [3, 3]]);

      [].concat(toConsumableArray(list.keys())).should.eql([0, 1, 2, 3]);

      [].concat(toConsumableArray(list[Symbol.iterator]())).should.eql([1, 2, 2, 3]);
    });

    it('every() / some()', function () {
      var list = p(M.List.fromArray([1, 2, 3]));

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
      var list = p(M.List.fromArray([2, 5, 9, 2]));

      var multipleOf = function multipleOf(x) {
        return function (n) {
          return n % x === 0;
        };
      };

      list.find(multipleOf(3)).should.be.exactly(9);

      list.findIndex(multipleOf(3)).should.be.exactly(2);
    });

    it('reduce() / reduceRight()', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));

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
      var list = p(M.List.fromArray([1, 2, 2, 3]));

      list.reverse().toJSON().should.eql([3, 2, 2, 1]);

      list.toJSON().should.eql([1, 2, 2, 3]);
    });

    it('copyWithin()', function () {
      var list = p(M.List.fromArray([1, 2, 3, 4, 5]));

      list.copyWithin(-2).toJSON().should.eql([1, 2, 3, 1, 2]);

      list.copyWithin(0, 3).toJSON().should.eql([4, 5, 3, 4, 5]);

      list.copyWithin(0, 3, 4).toJSON().should.eql([4, 2, 3, 4, 5]);

      list.copyWithin(-2, -3, -1).toJSON().should.eql([1, 2, 3, 3, 4]);
    });

    it('fill()', function () {
      var list = p(M.List.fromArray([1, 2, 3]));

      list.fill(4).toJSON().should.eql([4, 4, 4]);

      list.fill(4, 1, 2).toJSON().should.eql([1, 4, 3]);

      list.fill(4, 1, 1).toJSON().should.eql([1, 2, 3]);

      list.fill(4, -3, -2).toJSON().should.eql([4, 2, 3]);

      list.fill(4, NaN, NaN).toJSON().should.eql([1, 2, 3]);

      p(M.List.fromArray(Array(3))).fill(4).toJSON().should.eql([4, 4, 4]);
    });

    it('sort()', function () {
      var list = p(M.List.fromArray([1, 2, 5, 4, 3]));

      list.sort().toJSON().should.eql([1, 2, 3, 4, 5]);

      list.sort().toJSON().should.eql([1, 2, 3, 4, 5]);
    });

    it('sort(fn)', function () {
      var list = p(M.List.fromArray([1, 2, 5, 4, 3]));

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
      var list = p(M.List.fromArray([1, 2, 3]));

      list.map(function (x) {
        return x + 10;
      }).should.eql([11, 12, 13]);
    });
  };
});

var proxySet = (function (should, M) {
  return function () {
    var p = M.proxySet;

    it('size', function () {
      var set = p(M.Set.fromArray([1, 2, 2, 3]));

      set.size.should.be.exactly(3);
    });

    it('has() / add() / delete() / clear()', function () {
      var set1 = p(M.Set.fromArray([1, 2, 2, 3]));

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
      var set = p(M.Set.fromArray([1, 2, 2, 3]));

      [].concat(toConsumableArray(set.entries())).should.eql([[1, 1], [2, 2], [3, 3]]);
    });

    it('values() / keys() / [@@iterator]()', function () {
      var set = p(M.Set.fromArray([1, 2, 2, 3]));

      [].concat(toConsumableArray(set.values())).should.eql([1, 2, 3]);

      [].concat(toConsumableArray(set.keys())).should.eql([1, 2, 3]);

      [].concat(toConsumableArray(set[Symbol.iterator]())).should.eql([1, 2, 3]);
    });

    it('forEach()', function () {
      var set = p(M.Set.fromArray([1, 2, 2, 3]));

      var sum = 0;
      set.forEach(function (x) {
        return sum += x;
      });

      sum.should.be.exactly(6);
    });
  };
});

var proxyDate = (function (should, M) {
  return function () {
    var p = M.proxyDate;

    it('getters / setters', function () {
      var date1 = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

      var date2 = date1.setFullYear(2015);
      var date3 = date2.setMinutes(55);

      date2.getFullYear().should.be.exactly(2015);

      date1.getFullYear().should.be.exactly(1988);

      date1.getMinutes().should.be.exactly(0);

      date3.getMinutes().should.be.exactly(55);
    });
  };
});

var c51 = (function (should, M) {
  return function () {
    var Modelico = M.Modelico;

    var Country = function (_Modelico) {
      inherits(Country, _Modelico);

      function Country(code) {
        classCallCheck(this, Country);
        return possibleConstructorReturn(this, (Country.__proto__ || Object.getPrototypeOf(Country)).call(this, Country, { code: code }));
      }

      createClass(Country, null, [{
        key: 'metadata',
        value: function metadata() {
          return Modelico.metadata(Country);
        }
      }]);
      return Country;
    }(Modelico);

    it('should leave root elements that are not plain objects untouched', function () {
      Modelico.fromJSON(Country, '"ESP"').code().should.be.exactly('ESP');
    });
  };
});

var cases = (function (should, M) {
  return function () {
    describe('51: root elements', c51(should, M));
  };
});

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
    new Proxy({}, {});

    return true;
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

    describe('Base', Modelico.apply(undefined, deps));
    describe('AsIs', ModelicoAsIs.apply(undefined, toConsumableArray(utilsAndDeps)));
    describe('Map', ModelicoMap.apply(undefined, deps));
    describe('EnumMap', ModelicoEnumMap.apply(undefined, deps));
    describe('ModelicoList', ModelicoList.apply(undefined, deps));
    describe('ModelicoSet', ModelicoSet.apply(undefined, deps));

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