(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.modelicoSpec = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (should, M) {
  return function () {

    var Modelico = M.Modelico;
    var AsIs = M.AsIs;
    var List = M.List;

    var Animal = function (_Modelico) {
      _inherits(Animal, _Modelico);

      function Animal(fields) {
        _classCallCheck(this, Animal);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Animal).call(this, Animal, fields));
      }

      _createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = this.fields().name;
          return name === undefined ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }], [{
        key: 'metadata',
        value: function metadata() {
          return Object.freeze({ type: Animal, reviver: Modelico.buildReviver(Animal) });
        }
      }]);

      return Animal;
    }(Modelico);

    var Person = function (_Modelico2) {
      _inherits(Person, _Modelico2);

      function Person(fields) {
        _classCallCheck(this, Person);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Person).call(this, Person, fields));
      }

      _createClass(Person, [{
        key: 'fullName',
        value: function fullName() {
          var fields = this.fields();
          return [fields.givenName, fields.familyName].join(' ').trim();
        }
      }], [{
        key: 'subtypes',
        value: function subtypes() {
          return Object.freeze({
            'givenName': AsIs.metadata(String),
            'familyName': AsIs.metadata(String),
            'pets': List.metadata(Animal.metadata())
          });
        }
      }]);

      return Person;
    }(Modelico);

    Object.freeze(Animal);
    Object.freeze(Person);

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person = Modelico.fromJSON(Person, personJson);

      person.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person.fullName().should.be.exactly('Javier Cejudo');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');
    });
  };
};

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (should, M) {
  return function () {

    var Modelico = M.Modelico;
    var AsIs = M.AsIs;
    var List = M.List;

    var Animal = function (_Modelico) {
      _inherits(Animal, _Modelico);

      function Animal(fields) {
        _classCallCheck(this, Animal);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Animal).call(this, Animal, fields));
      }

      _createClass(Animal, [{
        key: 'speak',
        value: function speak() {
          var name = this.fields().name;
          return name === undefined ? 'I don\'t have a name' : 'My name is ' + name + '!';
        }
      }]);

      return Animal;
    }(Modelico);

    it('should showcase the main features', function () {
      var petJson = '{"name": "Robbie"}';

      var pet = Modelico.fromJSON(Animal, petJson);

      pet.speak().should.be.exactly('My name is Robbie!');
    });
  };
};

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function (_) {
    var deps = [should, M];

    describe('ModelicoBase', require('./types/Modelico').apply(_, deps));
    describe('ModelicoAsIs', require('./types/AsIs').apply(_, deps));
    describe('ModelicoMap', require('./types/Map').apply(_, deps));
    describe('ModelicoList', require('./types/List').apply(_, deps));
    describe('Readme Simple Example', require('./example/simple').apply(_, deps));
    describe('Readme Advanced Example', require('./example/advanced').apply(_, deps));
  };
};

},{"./example/advanced":1,"./example/simple":2,"./types/AsIs":4,"./types/List":5,"./types/Map":6,"./types/Modelico":7}],4:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var AsIs = M.AsIs;

    describe('constructor', function () {
      it('should create a simple wrapper for the value', function () {
        var asIsNumber = new AsIs(Number, 1);
        var asIsObject = new AsIs(Object, { two: 2 });

        should(asIsNumber.value()).be.exactly(1);
        asIsObject.value().should.eql({ two: 2 });
      });

      it('should be immutable', function () {
        var asIsObject = new AsIs(Object, { two: 2 });

        (function (_) {
          return AsIs.newStaticFn = function () {};
        }).should.throw();
        (function (_) {
          return asIsObject.value = 3;
        }).should.throw();

        asIsObject.value().two = 3;
        should(asIsObject.value().two).be.exactly(2);
      });
    });

    describe('toJSON', function () {
      it('should stringify the value as is', function () {
        var asIsNumber = new AsIs(Number, 1);
        var asIsObject = new AsIs(Object, { two: 2 });

        JSON.stringify(asIsNumber).should.be.exactly('1');
        JSON.stringify(asIsObject).should.be.exactly('{"two":2}');
      });
    });

    describe('reviver', function () {
      it('should revive the value as is, without the wrapper', function () {
        var asIsObject = JSON.parse('{"two":2}', AsIs.buildReviver(Object));

        should(asIsObject.two).be.exactly(2);
      });
    });

    describe('metadata', function () {
      it('should return metadata like type', function () {
        AsIs.metadata(String).type.should.be.exactly(String);

        var asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);
      });

      it('should be immutable', function () {
        (function (_) {
          return AsIs.metadata = {};
        }).should.throw();
      });
    });
  };
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;
    var ModelicoList = M.List;
    var ModelicoDate = M.Date;

    describe('stringifying', function () {
      it('should stringify the list correctly', function () {
        var list = [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')), new ModelicoDate(null)];

        var modelicoList = new ModelicoList(ModelicoDate.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null lists', function () {
        var list = null;
        var modelicoList = new ModelicoList(ModelicoDate.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the list correctly', function () {
        var modelicoList = JSON.parse('["1988-04-16T00:00:00.000Z",null]', ModelicoList.buildReviver(ModelicoDate.metadata()));

        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);

        should(modelicoList.list()[1].date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';

        var author = Modelico.fromJSON(Person, authorJson);

        should(author.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
      });

      it('should support null lists', function () {
        var modelicoList = JSON.parse('null', ModelicoList.buildReviver(ModelicoDate.metadata()));

        should(modelicoList.list()).be.exactly(null);
      });
    });

    describe('cloning', function () {
      it('should clone the map correctly', function () {
        var map = [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')), 'b', new ModelicoDate(null)];

        var modelicoList = new ModelicoList(ModelicoDate.metadata(), map);
        var modelicoListClone = modelicoList.clone();

        modelicoList.should.not.be.exactly(modelicoListClone);

        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);

        modelicoList.list().length = 0;

        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);

        should(modelicoListClone.list()[0].date().getFullYear()).be.exactly(1988);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoList = new ModelicoList(ModelicoDate.metadata(), [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]);

        var modelicoList2 = new ModelicoList(ModelicoDate.metadata(), [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]);

        modelicoList.should.not.be.exactly(modelicoList2);
        modelicoList.should.not.equal(modelicoList2);

        modelicoList.equals(modelicoList2).should.be.exactly(true);
      });
    });
  };
};

},{"./fixtures/Person":10}],6:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;
    var ModelicoAsIs = M.AsIs;
    var ModelicoMap = M.Map;
    var ModelicoDate = M.Date;

    describe('setting', function () {
      it('should set fields returning a new object', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';

        var author = Modelico.fromJSON(Person, authorJson);

        // sanity check
        JSON.stringify(author).should.be.exactly(authorJson);

        author.givenName().should.be.exactly('Javier');
        should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);

        // field setting
        var authorAlt = author.set('givenName', 'Javi');

        // date is protected by always returning a new one
        author.lifeEvents().map().get('wedding').date().setFullYear(2001);

        // repeat sanity check
        JSON.stringify(author).should.be.exactly(authorJson);

        author.givenName().should.be.exactly('Javier');
        should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);

        // new object checks
        (authorAlt === author).should.be.exactly(false);
        (authorAlt.lifeEvents().map() === author.lifeEvents().map()).should.be.exactly(false);
        authorAlt.equals(author).should.be.exactly(false);

        authorAlt.givenName().should.be.exactly('Javi');
        should(authorAlt.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);

        JSON.stringify(authorAlt).should.be.exactly('{"givenName":"Javi","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}');
      });
    });

    describe('stringifying', function () {
      it('should stringify the map correctly', function () {
        var map = new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))], ['b', new ModelicoDate(null)]]);

        var modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
      });

      it('should support null maps', function () {
        var map = null;
        var modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the map correctly', function () {
        var modelicoMap = JSON.parse('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]', ModelicoMap.buildReviver(ModelicoAsIs.metadata(String), ModelicoDate.metadata()));

        should(modelicoMap.map().get('a').date().getFullYear()).be.exactly(1988);

        should(modelicoMap.map().get('b').date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';

        var author = Modelico.fromJSON(Person, authorJson);

        should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);
      });

      it('should support null maps', function () {
        var modelicoMap = JSON.parse('null', ModelicoMap.buildReviver(ModelicoAsIs.metadata(String), ModelicoDate.metadata()));

        should(modelicoMap.map()).be.exactly(null);
      });
    });

    describe('cloning', function () {
      it('should clone the map correctly', function () {
        var map = new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))], ['b', new ModelicoDate(null)]]);

        var modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);
        var modelicoMapClone = modelicoMap.clone();

        modelicoMap.should.not.be.exactly(modelicoMapClone);

        should(modelicoMap.map().get('a').date().getFullYear()).be.exactly(1988);

        should(modelicoMapClone.map().get('a').date().getFullYear()).be.exactly(1988);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]]));

        var modelicoMap2 = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap2).should.be.exactly(true);
      });
    });
  };
};

},{"./fixtures/Person":10}],7:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);
    var PartOfDay = require('./fixtures/PartOfDay')(M);
    var Sex = require('./fixtures/Sex')(M);
    var Animal = require('./fixtures/Animal')(M);

    var Modelico = M.Modelico;
    var ModelicoDate = M.Date;

    var authorJson = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":"EVENING","sex":"MALE"}';
    var author2Json = '{"givenName":"Javier","familyName":"Cejudo","birthday":"1988-04-16T00:00:00.000Z","favouritePartOfDay":null,"sex":"MALE"}';

    describe('setting', function () {
      it('should set fields returning a new object', function () {
        var author = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        // sanity check
        JSON.stringify(author).should.be.exactly(authorJson);

        author.givenName().should.be.exactly('Javier');

        // field setting
        var authorAlt = author.set('givenName', 'Javi');

        // repeat sanity check
        author.givenName().should.be.exactly('Javier');

        JSON.stringify(author).should.be.exactly(authorJson);

        // new object checks
        (authorAlt === author).should.be.exactly(false);
        authorAlt.givenName().should.be.exactly('Javi');
        authorAlt.equals(author).should.be.exactly(false, 'Oops, they are equal');
      });
    });

    describe('stringifying', function () {
      it('should stringify types correctly', function () {
        var author = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        JSON.stringify(author).should.be.exactly(authorJson);
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
        var author = Modelico.fromJSON(Person, authorJson);
        var authorAlt = JSON.parse(authorJson, Modelico.buildReviver(Person));

        'Javier Cejudo'.should.be.exactly(author.fullName()).and.exactly(authorAlt.fullName());

        should(1988).be.exactly(author.birthday().date().getFullYear()).and.exactly(authorAlt.birthday().date().getFullYear());

        should(PartOfDay.EVENING().minTime).be.exactly(author.favouritePartOfDay().minTime).and.exactly(authorAlt.favouritePartOfDay().minTime);

        Sex.MALE().code.should.be.exactly(author.sex().code).and.exactly(authorAlt.sex().code);
      });

      it('should support null in Enum', function () {
        var author2 = Modelico.fromJSON(Person, author2Json);

        (author2.favouritePartOfDay() === null).should.be.exactly(true);
      });

      it('should work with plain classes extending Modelico', function () {
        var animal = JSON.parse('{"name": "Sam"}', Modelico.buildReviver(Animal));

        animal.speak().should.be.exactly('hello');
        animal.name().should.be.exactly('Sam');
      });
    });

    describe('cloning', function () {
      it('should support cloning', function () {
        var author = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))
          // equivalent but perhaps more convenient:
          // birthday: ModelicoDate.reviver('', '1988-04-16T00:00:00.000Z')
        });

        var authorClone = author.clone();
        var birthdayClone = author.birthday().clone();

        'Javier'.should.be.exactly(author.givenName()).and.exactly(authorClone.givenName());

        author.should.not.be.exactly(authorClone);

        should(1988).be.exactly(author.birthday().date().getFullYear()).and.exactly(birthdayClone.date().getFullYear());

        author.birthday().should.not.be.exactly(birthdayClone);
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
  };
};

},{"./fixtures/Animal":8,"./fixtures/PartOfDay":9,"./fixtures/Person":10,"./fixtures/Sex":11}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (M) {
  var Modelico = M.Modelico;

  var Animal = function (_Modelico) {
    _inherits(Animal, _Modelico);

    function Animal(fields) {
      _classCallCheck(this, Animal);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(Animal).call(this, Animal, fields));
    }

    _createClass(Animal, [{
      key: 'speak',
      value: function speak() {
        return 'hello';
      }
    }]);

    return Animal;
  }(Modelico);

  return Object.freeze(Animal);
};

},{}],9:[function(require,module,exports){
'use strict';

var range = function range(minTime, maxTime) {
  return { minTime: minTime, maxTime: maxTime };
};

module.exports = function (M) {
  return M.enumFactory({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
};

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (M) {
  var PartOfDay = require('./PartOfDay')(M).metadata;
  var Sex = require('./Sex')(M).metadata;

  var Modelico = M.Modelico;

  var ModelicoMap = M.Map.metadata;
  var ModelicoList = M.List.metadata;
  var ModelicoDate = M.Date.metadata;

  var joinWithSpace = function joinWithSpace(arr) {
    return arr.filter(function (x) {
      return x !== null && x !== undefined;
    }).join(' ');
  };

  var Person = function (_Modelico) {
    _inherits(Person, _Modelico);

    function Person(fields) {
      _classCallCheck(this, Person);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Person).call(this, Person, fields));

      Object.freeze(_this);
      return _this;
    }

    _createClass(Person, [{
      key: 'fullName',
      value: function fullName() {
        return joinWithSpace([this.givenName(), this.familyName()]);
      }
    }], [{
      key: 'subtypes',
      value: function subtypes() {
        return Object.freeze({
          'birthday': ModelicoDate(),
          'favouritePartOfDay': PartOfDay(),
          'lifeEvents': ModelicoMap(String, ModelicoDate()),
          'importantDatesList': ModelicoList(ModelicoDate()),
          'sex': Sex()
        });
      }
    }]);

    return Person;
  }(Modelico);

  return Object.freeze(Person);
};

},{"./PartOfDay":9,"./Sex":11}],11:[function(require,module,exports){
'use strict';

module.exports = function (M) {
  return M.enumFactory(['FEMALE', 'MALE', 'OTHER']);
};

},{}]},{},[3])(3)
});