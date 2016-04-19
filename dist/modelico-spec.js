(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.modelicoSpec = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (U, should, M) {
  return function () {
    var objToArr = U.objToArr;

    it('Getting started', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });
      var map2 = map1.set('b', 50);
      should(map1.innerMap().get('b')).be.exactly(2);
      should(map2.innerMap().get('b')).be.exactly(50);
    });

    U.skipIfNoProxies('Getting started (proxied)', function () {
      var _ = M.proxyMap;

      var map1 = _(M.Map.fromObject({ a: 1, b: 2, c: 3 }));
      var map2 = _(map1.set('b', 50));

      should(map1.size).be.exactly(3);
      should(map1.get('b')).be.exactly(2);
      should(map2.get('b')).be.exactly(50);
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

      var list2Array = list1.innerList();
      list2Array.push(3, 4, 5);
      var list2 = M.List.fromArray(list2Array);

      var list3Array = list2.innerList();
      list3Array.unshift(0);
      var list3 = M.List.fromArray(list3Array);

      var list4Array = list1.innerList();
      var list4 = M.List.fromArray(list1.innerList().concat(list2.innerList(), list3.innerList()));

      (list1.innerList().length === 2).should.be.exactly(true);
      (list2.innerList().length === 5).should.be.exactly(true);
      (list3.innerList().length === 6).should.be.exactly(true);
      (list4.innerList().length === 13).should.be.exactly(true);
      (list4.innerList()[0] === 1).should.be.exactly(true);
    });

    it('JavaScript-first API (2)', function () {
      var alpha = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      Array.from(alpha.innerMap()).map(function (kv) {
        return kv[0].toUpperCase();
      }).join().should.be.exactly('A,B,C,D');
    });

    it('Accepts raw JavaScript objects.', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3, d: 4 });
      var map2 = M.Map.fromObject({ c: 10, a: 20, t: 30 });

      var obj = { d: 100, o: 200, g: 300 };

      var map3 = M.Map.fromMap(new Map(Array.from(map1.innerMap()).concat(Array.from(map2.innerMap()), objToArr(obj))));

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
      map.innerMap().get('1').should.be.exactly('one');
      should(map.innerMap().get(1)).be.exactly(undefined);
    });

    it('Equality treats Collections as Data', function () {
      var map1 = M.Map.fromObject({ a: 1, b: 1, c: 1 });
      var map2 = M.Map.fromObject({ a: 1, b: 1, c: 1 });

      (map1 !== map2).should.be.exactly(true); // two different instances
      map1.equals(map2).should.be.exactly(true); // have equivalent values
    });

    it('Batching Mutations', function () {
      var list1 = M.List.fromArray([1, 2, 3]);
      var list2Array = list1.innerList();
      list2Array.push(4, 5, 6);
      var list2 = M.List.fromArray(list2Array);

      (list1.innerList().length === 3).should.be.exactly(true);
      (list2.innerList().length === 6).should.be.exactly(true);
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
        'givenName': AsIs(String),
        'familyName': AsIs(String),
        'pets': List.metadata(Animal.metadata())
      });
    };

    it('should showcase the main features', function () {
      var personJson = '{\n      "givenName": "Javier",\n      "familyName": "Cejudo",\n      "pets": [{\n        "name": "Robbie"\n      }]\n    }';

      var person1 = JSON.parse(personJson, Modelico.metadata(Person).reviver);

      person1.fullName().should.be.exactly('Javier Cejudo');

      var person2 = person1.set('givenName', 'Javi');
      person2.fullName().should.be.exactly('Javi Cejudo');
      person1.fullName().should.be.exactly('Javier Cejudo');

      person1.pets().innerList().shift().speak().should.be.exactly('My name is Robbie!');

      person1.pets().innerList().shift().speak().should.be.exactly('My name is Robbie!');
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
            'givenName': AsIs(M.Any),
            'familyName': AsIs(String),
            'pets': List.metadata(Animal.metadata())
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

      person1.pets().innerList().shift().speak().should.be.exactly('My name is Robbie!');

      person1.pets().innerList().shift().speak().should.be.exactly('My name is Robbie!');

      var person3 = person1.setPath(['pets', 0, 'name'], 'Bane');

      person3.pets().innerList()[0].name().should.be.exactly('Bane');

      person1.pets().innerList()[0].name().should.be.exactly('Robbie');
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

      var pet1 = JSON.parse(petJson, Modelico.metadata(Animal).reviver);

      pet1.speak().should.be.exactly('My name is Robbie!');

      var pet2 = pet1.set('name', 'Bane');

      pet2.name().should.be.exactly('Bane');
      pet1.name().should.be.exactly('Robbie');
    });
  };
};

},{}],5:[function(require,module,exports){
'use strict';

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
    skipIfLegacyIE: options.legacyIE ? it.skip : it,
    objToArr: function objToArr(obj) {
      return Object.keys(obj).map(function (k) {
        return [k, obj[k]];
      });
    }
  });
};

module.exports = function (options, should, M) {
  return function (_) {
    var U = buildUtils(options);
    var deps = [should, M];
    var utilsAndDeps = [U].concat(deps);

    describe('ModelicoBase', require('./types/Modelico').apply(_, deps));
    describe('ModelicoAsIs', require('./types/AsIs').apply(_, utilsAndDeps));
    describe('ModelicoMap', require('./types/Map').apply(_, deps));
    describe('ModelicoEnumMap', require('./types/EnumMap').apply(_, deps));
    describe('ModelicoList', require('./types/List').apply(_, deps));
    describe('ModelicoSet', require('./types/Set').apply(_, deps));
    describe('Readme Simple Example', require('./example/simple').apply(_, deps));
    describe('Readme Advanced Example', require('./example/advanced').apply(_, deps));
    describe('Readme Advanced Example ES5', require('./example/advanced.es5').apply(_, deps));
    describe('Immutable.js examples', require('./Immutable.js/').apply(_, utilsAndDeps));

    U.skipDescribeIfNoProxies('Proxies', function () {
      describe('Map', require('./proxies/proxyMap').apply(_, deps));
      describe('List', require('./proxies/proxyList').apply(_, deps));
      describe('Set', require('./proxies/proxySet').apply(_, deps));
      describe('Date', require('./proxies/proxyDate').apply(_, deps));
    });
  };
};

},{"./Immutable.js/":1,"./example/advanced":3,"./example/advanced.es5":2,"./example/simple":4,"./proxies/proxyDate":6,"./proxies/proxyList":7,"./proxies/proxyMap":8,"./proxies/proxySet":9,"./types/AsIs":10,"./types/EnumMap":11,"./types/List":12,"./types/Map":13,"./types/Modelico":14,"./types/Set":15}],6:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var p = M.proxyDate;

    it('should make Date methods available to Modelico Date', function () {
      var date = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

      date.getFullYear().should.be.exactly(1988);

      date.getMonth().should.be.exactly(3);
    });
  };
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var p = M.proxyList;

    it('should make Array methods available to Modelico List', function () {
      var list = p(M.List.fromArray([1, 2, 2, 3]));
      var add = function add(a, b) {
        return a + b;
      };

      list.reduce(add, 0).should.be.exactly(8);

      list.join('-').should.be.exactly('1-2-2-3');
    });

    it('should make Array properties available to Modelico List', function () {
      var list1 = p(M.List.fromArray([1, 2, 2, 3]));
      var list2 = p(list1.set(1, 50));

      list1[1].should.be.exactly(2);
      list2[1].should.be.exactly(50);

      list1.length.should.be.exactly(4);
    });
  };
};

},{}],8:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var p = M.proxyMap;

    it('should make Map methods available to Modelico Map', function () {
      var map1 = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));
      var map2 = p(map1.set('b', 50));

      should(map1.get('b')).be.exactly(2);
      should(map2.get('b')).be.exactly(50);
    });

    it('should make Map properties available to Modelico Map', function () {
      var map = p(M.Map.fromObject({ a: 1, b: 2, c: 3 }));

      should(map.size).be.exactly(3);
    });
  };
};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var p = M.proxySet;

    it('should make Set methods available to Modelico Set', function () {
      var set = p(M.Set.fromArray([1, 2, 2, 3]));

      Array.from(set.values()).reduce(function (a, b) {
        return a + b;
      }, 0).should.be.exactly(6);

      set.size.should.be.exactly(3);

      p(M.Set.fromSet(set.add(5))).size.should.be.exactly(4);
    });

    it('should make Set properties available to Modelico Set', function () {
      var set1 = p(M.Set.fromArray([1, 2, 2, 3]));
      var set2 = p(set1.set(1, 50));

      set1.size.should.be.exactly(3);
      set2.size.should.be.exactly(3);

      set1.has(2).should.be.exactly(true);
      set2.has(2).should.be.exactly(false);
    });
  };
};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function (U, should, M) {
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

      U.skipIfLegacyIE('should be immutable', function () {
        (function () {
          return AsIs().reviver = function (x) {
            return x;
          };
        }).should.throw();
      });
    });
  };
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var PartOfDay = require('./fixtures/PartOfDay')(M);

    describe('setting', function () {
      it('should set fields returning a new enum map', function () {
        var map = new Map([[PartOfDay.MORNING(), 'Good morning!'], [PartOfDay.AFTERNOON(), 'Good afternoon!'], [PartOfDay.EVENING(), 'Good evening!']]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.AsIs(String), map);
        var greetings2 = greetings1.set(PartOfDay.AFTERNOON(), 'GOOD AFTERNOON!');

        greetings2.innerMap().get(PartOfDay.AFTERNOON()).should.be.exactly('GOOD AFTERNOON!');

        greetings1.innerMap().get(PartOfDay.AFTERNOON()).should.be.exactly('Good afternoon!');
      });

      it('should set fields returning a new enum map when part of a path', function () {
        var map = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map);
        var greetings2 = greetings1.setPath([PartOfDay.EVENING(), 'date'], new Date('2013-04-16T00:00:00.000Z'));

        should(greetings2.innerMap().get(PartOfDay.EVENING()).date().getFullYear()).be.exactly(2013);

        should(greetings1.innerMap().get(PartOfDay.EVENING()).date().getFullYear()).be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', function () {
        var map1 = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1988-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2000-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2012-04-16T00:00:00.000Z'))]]);

        var map2 = new Map([[PartOfDay.MORNING(), new M.Date(new Date('1989-04-16T00:00:00.000Z'))], [PartOfDay.AFTERNOON(), new M.Date(new Date('2001-04-16T00:00:00.000Z'))], [PartOfDay.EVENING(), new M.Date(new Date('2013-04-16T00:00:00.000Z'))]]);

        var greetings1 = new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map1);
        var greetings2 = greetings1.setPath([], new M.EnumMap(PartOfDay.metadata(), M.Date.metadata(), map2));

        should(greetings2.innerMap().get(PartOfDay.EVENING()).date().getFullYear()).be.exactly(2013);

        should(greetings1.innerMap().get(PartOfDay.EVENING()).date().getFullYear()).be.exactly(2012);
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

        greetings.innerMap().get(PartOfDay.MORNING()).should.be.exactly('Good morning!');
      });

      it('should support null enum maps', function () {
        var greetings = JSON.parse('null', M.EnumMap.metadata(PartOfDay.metadata(), M.AsIs(String)).reviver);

        should(greetings.innerMap()).be.exactly(null);
      });
    });
  };
};

},{"./fixtures/PartOfDay":17}],12:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;

    describe('setting', function () {
      it('should set items in the list correctly', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoList2.innerList()[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(modelicoList2.innerList()[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear()).be.exactly(1988);
      });

      it('should set items in the list correctly when part of a path with a single element', function () {
        var list = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoList1 = new M.List(M.Date.metadata(), list);
        var modelicoList2 = modelicoList1.setPath([0], new M.Date(new Date('2000-04-16T00:00:00.000Z')));

        should(modelicoList2.innerList()[0].date().getFullYear()).be.exactly(2000);

        // verify that modelicoList1 was not mutated
        should(modelicoList1.innerList()[0].date().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole list', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        var newListArray = author1.importantDatesList().innerList();
        newListArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesList', new M.List(M.Date.metadata(), newListArray));

        should(author1.importantDatesList().innerList().length).be.exactly(2);
        should(author1.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
        should(author1.importantDatesList().innerList()[1].date().getFullYear()).be.exactly(2012);

        should(author2.importantDatesList().innerList().length).be.exactly(3);
        should(author2.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
        should(author2.importantDatesList().innerList()[1].date().getFullYear()).be.exactly(2016);
        should(author2.importantDatesList().innerList()[2].date().getFullYear()).be.exactly(2012);
      });

      it('edge case when List setPath is called with an empty path', function () {
        var modelicoDatesList1 = new M.List(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)]);

        var modelicoDatesList2 = new M.List(M.Date.metadata(), [new M.Date(new Date('2016-04-16T00:00:00.000Z'))]);

        var listOfListOfDates1 = new M.List(M.List.metadata(M.Date.metadata()), [modelicoDatesList1]);
        var listOfListOfDates2 = listOfListOfDates1.setPath([0], modelicoDatesList2);

        should(listOfListOfDates1.innerList()[0].innerList()[0].date().getFullYear()).be.exactly(1988);

        should(listOfListOfDates2.innerList()[0].innerList()[0].date().getFullYear()).be.exactly(2016);
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

        should(modelicoList.innerList()[0].date().getFullYear()).be.exactly(1988);

        should(modelicoList.innerList()[1].date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should(author.importantDatesList().innerList()[0].date().getFullYear()).be.exactly(2013);
      });

      it('should support null lists', function () {
        var modelicoList = JSON.parse('null', M.List.metadata(M.Date.metadata()).reviver);

        should(modelicoList.innerList()).be.exactly(null);
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

        var modelicoSet = M.List.fromArray(fibArray);

        modelicoSet.innerList().should.eql([0, 1, 1, 2, 3, 5, 8]);
      });
    });
  };
};

},{"./fixtures/Person":18}],13:[function(require,module,exports){
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

        var modelicoMap1 = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);
        var modelicoMap2 = modelicoMap1.set('a', new ModelicoDate(new Date('1989-04-16T00:00:00.000Z')));

        should(modelicoMap2.innerMap().get('a').date().getFullYear()).be.exactly(1989);

        // verify that modelicoMap1 was not mutated
        should(modelicoMap1.innerMap().get('a').date().getFullYear()).be.exactly(1988);
      });

      it('should set fields returning a new map when part of a path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author1 = Modelico.fromJSON(Person, authorJson);
        var author2 = author1.setPath(['lifeEvents', 'wedding', 'date'], new Date('2013-03-28T00:00:00.000Z'));

        should(author2.lifeEvents().innerMap().get('wedding').date().getFullYear()).be.exactly(2013);

        // verify that author1 was not mutated
        should(author1.lifeEvents().innerMap().get('wedding').date().getFullYear()).be.exactly(2012);
      });

      it('edge case when setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2012-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);

        var map = author.lifeEvents();

        should(map.innerMap().get('wedding').date().getFullYear()).be.exactly(2012);

        var customMap = new Map([['wedding', new ModelicoDate(new Date('2013-03-28T00:00:00.000Z'))]]);

        var customModelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), customMap);
        var map2 = map.setPath([], customModelicoMap);

        should(map2.innerMap().get('wedding').date().getFullYear()).be.exactly(2013);
      });
    });

    describe('stringifying', function () {
      it('should stringify the map correctly', function () {
        var map = new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))], ['b', new ModelicoDate(null)]]);

        var modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]');
      });

      it('should support null maps', function () {
        var map = null;
        var modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), map);

        JSON.stringify(modelicoMap).should.be.exactly('null');
      });
    });

    describe('parsing', function () {
      it('should parse the map correctly', function () {
        var modelicoMap = JSON.parse('[{"key":"a","value":"1988-04-16T00:00:00.000Z"},{"key":"b","value":null}]', ModelicoMap.metadata(ModelicoAsIs(String), ModelicoDate.metadata()).reviver);

        should(modelicoMap.innerMap().get('a').date().getFullYear()).be.exactly(1988);

        should(modelicoMap.innerMap().get('b').date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","lifeEvents":[{"key":"wedding","value":"2013-03-28T00:00:00.000Z"},{"key":"moved to Australia","value":"2012-12-03T00:00:00.000Z"}]}';
        var author = Modelico.fromJSON(Person, authorJson);

        should(author.lifeEvents().innerMap().get('wedding').date().getFullYear()).be.exactly(2013);
      });

      it('should support null maps', function () {
        var modelicoMap = JSON.parse('null', ModelicoMap.metadata(ModelicoAsIs(String), ModelicoDate.metadata()).reviver);

        should(modelicoMap.innerMap()).be.exactly(null);
      });
    });

    describe('comparing', function () {
      it('should identify equal instances', function () {
        var modelicoMap = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]]));

        var modelicoMap2 = new ModelicoMap(ModelicoAsIs(String), ModelicoDate.metadata(), new Map([['a', new ModelicoDate(new Date('1988-04-16T00:00:00.000Z'))]]));

        modelicoMap.should.not.be.exactly(modelicoMap2);
        modelicoMap.should.not.equal(modelicoMap2);

        modelicoMap.equals(modelicoMap2).should.be.exactly(true);
      });
    });

    describe('from object', function () {
      it('should be able to create a set from an array', function () {
        var map1 = M.Map.fromObject({ a: 1, b: 2, c: 3 });

        should(map1.innerMap().get('b')).be.exactly(2);
      });
    });

    describe('from map', function () {
      it('should be able to create a set from a native set', function () {
        var map1 = M.Map.fromMap(new Map([['a', 1], ['b', 2], ['c', 3]]));

        should(map1.innerMap().get('b')).be.exactly(2);
      });
    });
  };
};

},{"./fixtures/Person":18}],14:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);
    var PartOfDay = require('./fixtures/PartOfDay')(M);
    var Sex = require('./fixtures/Sex')(M);
    var Animal = require('./fixtures/Animal')(M);

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

        should(author2.birthday().date().getFullYear()).be.exactly(1989);

        // verify that the original author1 was not mutated
        should(author1.birthday().date().getFullYear()).be.exactly(1988);
      });

      it('edge case when Modelico setPath is called with an empty path', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesList":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);
        var listOfPeople1 = new M.List(Person.metadata(), [author]);

        var listOfPeople2 = listOfPeople1.setPath([0, 'givenName'], 'Javi');
        var listOfPeople3 = listOfPeople2.setPath([0], author);

        listOfPeople1.innerList()[0].givenName().should.be.exactly('Javier');
        listOfPeople2.innerList()[0].givenName().should.be.exactly('Javi');
        listOfPeople3.innerList()[0].givenName().should.be.exactly('Javier');
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

        should(1988).be.exactly(author1.birthday().date().getFullYear()).and.exactly(author2.birthday().date().getFullYear());

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
  };
};

},{"./fixtures/Animal":16,"./fixtures/PartOfDay":17,"./fixtures/Person":18,"./fixtures/Sex":19}],15:[function(require,module,exports){
'use strict';

module.exports = function (should, M) {
  return function () {
    var Person = require('./fixtures/Person')(M);

    var Modelico = M.Modelico;

    describe('setting', function () {
      it('should set items in the set correctly', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.set(0, new M.Date(new Date('1989-04-16T00:00:00.000Z')));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear()).be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.setPath([0, 'date'], new Date('1989-04-16T00:00:00.000Z'));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear()).be.exactly(1989);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear()).be.exactly(1988);
      });

      it('should set items in the set correctly when part of a path with a single element', function () {
        var set = [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)];

        var modelicoSet1 = new M.Set(M.Date.metadata(), set);
        var modelicoSet2 = modelicoSet1.setPath([0], new M.Date(new Date('2000-04-16T00:00:00.000Z')));

        should(Array.from(modelicoSet2.innerSet())[0].date().getFullYear()).be.exactly(2000);

        // verify that modelicoSet1 was not mutated
        should(Array.from(modelicoSet1.innerSet())[0].date().getFullYear()).be.exactly(1988);
      });

      it('should be able to set a whole set', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author1 = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        var newSetArray = Array.from(author1.importantDatesSet().innerSet());
        newSetArray.splice(1, 0, new M.Date(new Date('2016-05-03T00:00:00.000Z')));

        var author2 = author1.set('importantDatesSet', new M.Set(M.Date.metadata(), newSetArray));

        var author1InnerSet = author1.importantDatesSet().innerSet();

        should(author1InnerSet.size).be.exactly(2);
        should(Array.from(author1InnerSet)[0].date().getFullYear()).be.exactly(2013);
        should(Array.from(author1InnerSet)[1].date().getFullYear()).be.exactly(2012);

        var author2InnerSet = author2.importantDatesSet().innerSet();

        should(author2InnerSet.size).be.exactly(3);
        should(Array.from(author2InnerSet)[0].date().getFullYear()).be.exactly(2013);
        should(Array.from(author2InnerSet)[1].date().getFullYear()).be.exactly(2016);
        should(Array.from(author2InnerSet)[2].date().getFullYear()).be.exactly(2012);
      });

      it('edge case when Set setPath is called with an empty path', function () {
        var modelicoDatesSet1 = new M.Set(M.Date.metadata(), [new M.Date(new Date('1988-04-16T00:00:00.000Z')), new M.Date(null)]);

        var modelicoDateSet2 = new M.Set(M.Date.metadata(), [new M.Date(new Date('2016-04-16T00:00:00.000Z'))]);

        var setOfSetsOfDates1 = new M.Set(M.Set.metadata(M.Date.metadata()), [modelicoDatesSet1]);
        var setOfSetsOfDates2 = setOfSetsOfDates1.setPath([0], modelicoDateSet2);

        should(Array.from(Array.from(setOfSetsOfDates1.innerSet())[0].innerSet())[0].date().getFullYear()).be.exactly(1988);

        should(Array.from(Array.from(setOfSetsOfDates2.innerSet())[0].innerSet())[0].date().getFullYear()).be.exactly(2016);
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

        should(Array.from(modelicoSet.innerSet())[0].date().getFullYear()).be.exactly(1988);

        should(Array.from(modelicoSet.innerSet())[1].date()).be.exactly(null);
      });

      it('should be parsed correctly when used within another class', function () {
        var authorJson = '{"givenName":"Javier","familyName":"Cejudo","importantDatesSet":["2013-03-28T00:00:00.000Z","2012-12-03T00:00:00.000Z"]}';
        var author = JSON.parse(authorJson, Modelico.metadata(Person).reviver);

        should(Array.from(author.importantDatesSet().innerSet())[0].date().getFullYear()).be.exactly(2013);
      });

      it('should support null sets', function () {
        var modelicoSet = JSON.parse('null', M.Set.metadata(M.Date.metadata()).reviver);

        should(modelicoSet.innerSet()).be.exactly(null);
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

        Array.from(modelicoSet.innerSet()).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });

    describe('from set', function () {
      it('should be able to create a set from a native set', function () {
        var fibSet = new Set([0, 1, 1, 2, 3, 5, 8]);

        var modelicoSet = M.Set.fromSet(fibSet);

        Array.from(modelicoSet.innerSet()).should.eql([0, 1, 2, 3, 5, 8]);
      });
    });
  };
};

},{"./fixtures/Person":18}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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
  var ModelicoSet = M.Set.metadata;
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
          'importantDatesSet': ModelicoSet(ModelicoDate()),
          'sex': Sex()
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
};

},{"./PartOfDay":17,"./Sex":19}],19:[function(require,module,exports){
'use strict';

module.exports = function (M) {
  return new M.Enum(['FEMALE', 'MALE', 'OTHER']);
};

},{}]},{},[5])(5)
});