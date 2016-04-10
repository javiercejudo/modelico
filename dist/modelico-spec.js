(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.modelicoSpec = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var objToArr = function objToArr(obj) {
  return Object.keys(obj).map(function (k) {
    return [k, obj[k]];
  });
};

module.exports = function (should, M) {
  return function () {
    it('Getting started', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });
      var map2 = map1.set('b', 50);
      should(map1.map().get('b')).be.exactly(2);
      should(map2.map().get('b')).be.exactly(50);
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

      var list2Array = list1.list();
      list2Array.push(3, 4, 5);
      var list2 = M.List.fromArray(list2Array);

      var list3Array = list2.list();
      list3Array.unshift(0);
      var list3 = M.List.fromArray(list3Array);

      var list4Array = list1.list();
      var list4 = M.List.fromArray(list1.list().concat(list2.list(), list3.list()));

      (list1.list().length === 2).should.be.exactly(true);
      (list2.list().length === 5).should.be.exactly(true);
      (list3.list().length === 6).should.be.exactly(true);
      (list4.list().length === 13).should.be.exactly(true);
      (list4.list()[0] === 1).should.be.exactly(true);
    });

    it('JavaScript-first API (2)', function () {
      var alpha = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      [].concat(_toConsumableArray(alpha.map())).map(function (kv) {
        return kv[0].toUpperCase();
      }).join().should.be.exactly('A,B,C,D');
    });

    it('Accepts raw JavaScript objects.', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      var map2 = M.Map.fromObject({ c: 10, a: 20, t: 30 });

      var obj = { d: 100, o: 200, g: 300 };

      var map3 = M.Map.fromMap(new Map([].concat(_toConsumableArray(map1.map())).concat([].concat(_toConsumableArray(map2.map())), objToArr(obj))));

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
      map.map().get('1').should.be.exactly('one');
      should(map.map().get(1)).be.exactly(undefined);
    });

    it('Equality treats Collections as Data', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 1, c: 1 });
      var map2 = M.Map.fromObject({ a: 1, b: 1, c: 1 });

      (map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = M.List.fromArray([1, 2, 3]);
      var list2Array = list1.list();
      list2Array.push(4, 5, 6);
      var list2 = M.List.fromArray(list2Array);

      (list1.list().length === 3).should.be.exactly(true);
      (list2.list().length === 6).should.be.exactly(true);
    });
  };
};

},{}],2:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {

    var Modelico = M.Modelico;
    var AsIs = M.AsIs;
    var List = M.List;

    function Animal(fields) {
      Modelico.factory(Animal, fields, this);
    }

    Animal.prototype = Object.create(Modelico.prototype);

    Animal.prototype.speak = function () {
      var name = this.fields().name;
      return name === undefined ? "I don't have a name" : 'My name is ' + name + '!';
    };

    Animal.metadata = Modelico.metadata.bind(undefined, Animal);

    function Person(fields) {
      Modelico.factory(Person, fields, this);
    }

    Person.prototype = Object.create(Modelico.prototype);

    Person.prototype.fullName = function () {
      var fields = this.fields();
      return [fields.givenName, fields.familyName].join(' ').trim();
    };

    Person.innerTypes = function () {
      return Object.freeze({
        'givenName': AsIs.metadata(String),
        'familyName': AsIs.metadata(String),
        'pets': List.metadata(Animal.metadata())
      });
    };

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person.fullName().should.be.exactly('Javier Cejudo');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');
    });
  };
};

},{}],3:[function(require,module,exports){
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
          return Modelico.metadata(Animal);
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
        key: 'innerTypes',
        value: function innerTypes() {
          return Object.freeze({
            'givenName': AsIs.metadata(String),
            'familyName': AsIs.metadata(String),
            'pets': List.metadata(Animal.metadata())
          });
        }
      }]);

      return Person;
    }(Modelico);

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person.fullName().should.be.exactly('Javier Cejudo');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');

      person.pets().list().shift().speak().should.be.exactly('My name is Robbie!');

      var person3 = person.setPath(['pets', 0, 'name'], 'Baine');

      person3.pets().list()[0].name().should.be.exactly('Baine');

      person.pets().list()[0].name().should.be.exactly('Robbie');
    });
  };
};

},{}],4:[function(require,module,exports){
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

      var pet = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

      pet.speak().should.be.exactly('My name is Robbie!');

      var pet2 = pet.set('name', 'Baine');

      pet2.name().should.be.exactly('Baine');
      pet.name().should.be.exactly('Robbie');
    });
  };
};

},{}],5:[function(require,module,exports){
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
    describe('Readme Advanced Example ES5', require('./example/advanced.es5').apply(_, deps));
    describe('Immutable.js examples', require('./Immutable.js/').apply(_, deps));
  };
};

},{"./Immutable.js/":1,"./example/advanced":3,"./example/advanced.es5":2,"./example/simple":4,"./types/AsIs":6,"./types/List":7,"./types/Map":8,"./types/Modelico":9}],6:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var AsIs = M.AsIs;
    var List = M.List;

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

    describe('setting', function () {
      it('should set the entity correctly', function () {
        var asIsNumber = new AsIs(Number, 1);
        var asIsNumber2 = asIsNumber.set(2);

        should(asIsNumber2.value()).be.exactly(2);

        // verify that asIsNumber was not mutated
        should(asIsNumber.value()).be.exactly(1);
      });

      it('should set the entity correctly when part of a path', function () {
        var list = [new AsIs(String, 'a'), new AsIs(String, 'b')];

        var modelicoList = new List(AsIs.metadata(String), list);
        var modelicoList2 = modelicoList.setPath([1], 'B');

        modelicoList2.list()[1].value().should.be.exactly('B');

        // verify that modelicoList was not mutated
        modelicoList.list()[1].value().should.be.exactly('b');
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
        var asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);

        should(asIsObject.two).be.exactly(2);
      });
    });

    describe('metadata', function () {
      it('should return metadata like type', function () {
        AsIs.metadata(String).type.should.be.exactly(String);

        var asIsObject = JSON.parse('{"two":2}', AsIs.metadata(Object).reviver);

        should(asIsObject.two).be.exactly(2);
      });

      it('should be immutable', function () {
        (function (_) {
          return AsIs.metadata = {};
        }).should.throw();
      });
    });
  };
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;
    var List = M.List;
    var ModelicoDate = M.Date;

    describe('setting', function () {
      it('should set items in the list correctly', function () {
        var list = [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')), new ModelicoDate(null)];

        var modelicoList = new List(ModelicoDate.metadata(), list);

        var modelicoList2 = modelicoList.set(0, new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoList2.list()[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoList was not mutated
        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', function () {
        var list = [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')), new ModelicoDate(null)];

        var modelicoList = new List(ModelicoDate.metadata(), list);
        var modelicoList2 = modelicoList.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.list()[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoList was not mutated
        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);
      });
    });

    describe('stringifying', function () {
      it('should stringify the list correctly', function () {
        var list = [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')), new ModelicoDate(null)];

        var modelicoList = new List(ModelicoDate.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('["1988-04-16T00:00:00.000Z",null]');
      });

      it('should support null lists', function () {
        var list = null;
        var modelicoList = new List(ModelicoDate.metadata(), list);

        JSON.stringify(modelicoList).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the list correctly', function () {
        var modelicoList = JSON.parse('["1988-04-16T00:00:00.000Z",null]', List.metadata(ModelicoDate.metadata()).reviver);

        should(modelicoList.list()[0].date().getFullYear()).be.exactly(1988);

        should(modelicoList.list()[1].date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = Modelico.fromJSON(Person, authorJson);

        should(author.importantDatesList().list()[0].date().getFullYear()).be.exactly(2013);
      });

      it('should support null lists', function () {
        var modelicoList = JSON.parse('null', List.metadata(ModelicoDate.metadata()).reviver);

        should(modelicoList.list()).be.exactly(null);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoList = new List(ModelicoDate.metadata(), [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]);

        var modelicoList2 = new List(ModelicoDate.metadata(), [new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]);

        modelicoList.should.not.be.exactly(modelicoList2);
        modelicoList.should.not.equal(modelicoList2);

        modelicoList.equals(modelicoList2).should.be.exactly(true);
      });
    });
  };
};

},{"./fixtures/Person":12}],8:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;
    var ModelicoAsIs = M.AsIs;
    var ModelicoMap = M.Map;
    var ModelicoDate = M.Date;

    describe('setting', function () {
      it('should set fields returning a new map', function () {
        var map = new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))], ['b', new ModelicoDate(null)]]);

        var modelicoMap = new ModelicoMap(ModelicoAsIs.metadata(String), ModelicoDate.metadata(), map);
        var modelicoMap2 = modelicoMap.set('a', new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.map().get('a').date().getFullYear()).be.exactly(1989);

        // verify that modelicoMap was not mutated
        should(modelicoMap.map().get('a').date().getFullYear()).be.exactly(1988);
      });

      it('should set fields returning a new map when part of a path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);
        var author2 = author.setPath(['lifeEvents', 'wedding', 'date'], new Date('2013-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);

        // verify that author was not mutated
        should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2012);
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
        var modelicoMap = JSON.parse('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]', ModelicoMap.metadata(ModelicoAsIs.metadata(String), ModelicoDate.metadata()).reviver);

        should(modelicoMap.map().get('a').date().getFullYear()).be.exactly(1988);

        should(modelicoMap.map().get('b').date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);

        should(author.lifeEvents().map().get('wedding').date().getFullYear()).be.exactly(2013);
      });

      it('should support null maps', function () {
        var modelicoMap = JSON.parse('null', ModelicoMap.metadata(ModelicoAsIs.metadata(String), ModelicoDate.metadata()).reviver);

        should(modelicoMap.map()).be.exactly(null);
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

},{"./fixtures/Person":12}],9:[function(require,module,exports){
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

      it('should set fields recursively returning a new object', function () {
        var author = new Person({
          givenName: 'Javier',
          familyName: 'Cejudo',
          birthday: new ModelicoDate(new Date('1988-04-16T00:00:00.000Z')),
          favouritePartOfDay: PartOfDay.EVENING(),
          sex: Sex.MALE()
        });

        var author2 = author.setPath(['givenName'], 'Javi').setPath(['birthday', 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(author2.birthday().date().getFullYear()).be.exactly(1989);

        // verify that the original author was not mutated
        should(author.birthday().date().getFullYear()).be.exactly(1988);
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
        var authorAlt = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

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
  };
};

},{"./fixtures/Animal":10,"./fixtures/PartOfDay":11,"./fixtures/Person":12,"./fixtures/Sex":13}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict';

var range = function range(minTime, maxTime) {
  return { minTime: minTime, maxTime: maxTime };
};

module.exports = function (M) {
  return new M.Enum({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
};

},{}],12:[function(require,module,exports){
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
      key: 'innerTypes',
      value: function innerTypes() {
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

},{"./PartOfDay":11,"./Sex":13}],13:[function(require,module,exports){
'use strict';

module.exports = function (M) {
  return new M.Enum(['FEMALE', 'MALE', 'OTHER']);
};

},{}]},{},[5])(5)
});