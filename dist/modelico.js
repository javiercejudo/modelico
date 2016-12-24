(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(function() {
		var current = global.Modelico;
		var exports = factory();
		global.Modelico = exports;
		exports.noConflict = function() { global.Modelico = current; return exports; };
	})();
}(this, (function () { 'use strict';

var version = "19.0.5";





var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

var typeSymbol = Symbol('type');
var fieldsSymbol = Symbol('fields');

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
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

















var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// @flow

var get$$1 = function get$$1(field /* : string */) {
  return function (obj /* : Object */) {
    return obj[field];
  };
};
var pipe2 = function pipe2(fn1 /* : Function */, fn2 /* : Function */) {
  return function () {
    return (/* : Array<mixed> */fn2(fn1.apply(undefined, arguments))
    );
  };
};
var not = function not(x /* : boolean */) {
  return (/* : boolean */!x
  );
};

var identity = /* :: <T> */function identity(x /* : T */) {
  return (/* : T */x
  );
};

var partial = function partial(fn /* : Function */) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return (/* : Array<mixed> */fn.bind.apply(fn, [undefined].concat(args))
  );
};
var asIsReviver = function asIsReviver(Type /* : Function */) {
  return function (k /* : string */, v /* : mixed */) {
    return Type(v);
  };
};
var always = /* :: <T> */function always(x /* : T */) {
  return function () {
    return (/* : T */x
    );
  };
};
var isNothing = function isNothing(v /* : mixed */) {
  return (/* : boolean */v == null || Number.isNaN(v)
  );
};
var isSomething = pipe2(isNothing, not);
var defaultTo = function defaultTo(d /* : mixed */) {
  return function (v /* : mixed */) {
    return isNothing(v) ? d : v;
  };
};
var objToArr = function objToArr(obj /* : Object */) {
  return Object.keys(obj).map(function (k) {
    return [k, obj[k]];
  });
};
var reviverOrAsIs = pipe2(get$$1('reviver'), defaultTo(asIsReviver(identity)));
var isPlainObject = function isPlainObject(x /* : mixed */) {
  return (/* : boolean */(typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x
  );
};
var emptyObject = Object.freeze({});

var haveSameValues = function haveSameValues(a /* : any */, b /* : any */) {
  return (/* : boolean */a === b || Object.is(a, b)
  );
};

var haveSameType = function haveSameType(a /* : any */, b /* : any */) {
  return (/* : boolean */a == null || b == null ? a === b : a.constructor === b.constructor
  );
};

var haveDifferentTypes = pipe2(haveSameType, not);

var equals$1 = function equals$1(a /* : any */, b /* : any */) {
  return (/* : boolean */isSomething(a) && a.equals ? a.equals(b) : haveSameValues(a, b)
  );
};

var getInnerTypes = function getInnerTypes(depth /* : number */, Type /* : Function */) {
  if (!Type.innerTypes) {
    throw Error('missing static innerTypes for ' + (Type.displayName || Type.name));
  }

  return Type.innerTypes(depth + 1, Type);
};

var unsupported = function unsupported(message /* : string */) {
  throw Error(message);
};

var innerTypesCache = new WeakMap();

var getInnerTypesWithCache = function getInnerTypesWithCache(depth, Type) {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(depth, Type));
  }

  return innerTypesCache.get(Type);
};

var plainObjectReviverFactory = function plainObjectReviverFactory(depth, Type, k, v) {
  return Object.keys(v).reduce(function (acc, field) {
    var innerTypes = getInnerTypesWithCache(depth, Type);

    var metadata = innerTypes[field];

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field]);
    } else {
      acc[field] = v[field];
    }

    return acc;
  }, {});
};

var reviverFactory = function reviverFactory(depth, Type) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var fields = isPlainObject(v) ? plainObjectReviverFactory(depth, Type, k, v) : v;

    return new Type(fields);
  };
};

var Base = function () {
  function Base(Type) {
    var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;
    var thisArg = arguments[2];
    classCallCheck(this, Base);

    if (!isPlainObject(fields)) {
      throw TypeError('expected an object with fields for ' + (Type.displayName || Type.name) + ' but got ' + fields);
    }

    Object.freeze(fields);

    var innerTypes = getInnerTypes(0, Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(fields);

    Object.keys(innerTypes).forEach(function (key) {
      var valueCandidate = fields[key];
      var value = M.Maybe.EMPTY;

      if (isSomething(valueCandidate)) {
        value = valueCandidate;
      } else if (innerTypes[key].type !== M.Maybe) {
        throw TypeError('no value for key "' + key + '"');
      }

      thisArg[key] = always(value);
    });
  }

  createClass(Base, [{
    key: 'set',
    value: function set(field, value) {
      var newFields = Object.assign({}, this[fieldsSymbol](), defineProperty({}, field, value));

      return new (this[typeSymbol]())(newFields);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return new (this[typeSymbol]())(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this[key]();

      if (!item.setPath) {
        return this.set(key, value);
      }

      return this.set(key, item.setPath(restPath, value));
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return JSON.stringify(this) === JSON.stringify(other);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this[fieldsSymbol]();
    }
  }, {
    key: 'toJS',
    value: function toJS() {
      return JSON.parse(JSON.stringify(this));
    }
  }, {
    key: 'stringify',
    value: function stringify(n) {
      return JSON.stringify(this, null, n);
    }
  }], [{
    key: 'factory',
    value: function factory() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new (Function.prototype.bind.apply(Base, [null].concat(args)))();
    }
  }]);
  return Base;
}();

var Base$1 = Object.freeze(Base);

var reviverFactory$2 = function reviverFactory$2(itemMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var maybeValue = v === null ? null : itemMetadata.reviver(k, v);

    return new Maybe(maybeValue);
  };
};

var Nothing = function () {
  function Nothing() {
    classCallCheck(this, Nothing);
  }

  createClass(Nothing, [{
    key: 'toJSON',
    value: function toJSON() {
      return null;
    }
  }]);
  return Nothing;
}();

var Just = function () {
  function Just(v) {
    classCallCheck(this, Just);

    this.get = always(v);

    Object.freeze(this);
  }

  createClass(Just, [{
    key: 'toJSON',
    value: function toJSON() {
      var v = this.get();

      if (isNothing(v)) {
        return null;
      }

      return v.toJSON ? v.toJSON() : v;
    }
  }]);
  return Just;
}();

var nothing = new Nothing();

var Maybe = function (_Base) {
  inherits(Maybe, _Base);

  function Maybe(v) {
    var nothingCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    classCallCheck(this, Maybe);

    var _this = possibleConstructorReturn(this, (Maybe.__proto__ || Object.getPrototypeOf(Maybe)).call(this, Maybe));

    var inner = nothingCheck && isNothing(v) ? nothing : new Just(v);

    _this.inner = always(inner);

    Object.freeze(_this);
    return _this;
  }

  createClass(Maybe, [{
    key: 'set',
    value: function set(field, v) {
      if (this.isEmpty()) {
        return this;
      }

      var item = this.inner().get();

      if (isNothing(item)) {
        return this;
      }

      var newItem = item.set ? item.set(field, v) : null;

      return new Maybe(newItem);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, v) {
      if (path.length === 0) {
        return Maybe.of(v);
      }

      if (this.isEmpty()) {
        return this;
      }

      var item = this.inner().get();

      if (isNothing(item)) {
        return this;
      }

      var inner = item.setPath ? item.setPath(path, v) : null;

      return Maybe.of(inner);
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.inner() === nothing;
    }
  }, {
    key: 'getOrElse',
    value: function getOrElse(v) {
      return this.isEmpty() ? v : this.inner().get();
    }
  }, {
    key: 'map',
    value: function map(f) {
      return this.isEmpty() ? this : Maybe.ofAny(f(this.inner().get()));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner().toJSON();
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      var inner = this.inner();
      var otherInner = other.inner();

      if (this.isEmpty() || other.isEmpty()) {
        return inner === otherInner;
      }

      var innerItem = inner.get();
      var otherInnerItem = otherInner.get();

      return isSomething(innerItem) && innerItem.equals ? innerItem.equals(otherInnerItem) : haveSameValues(innerItem, otherInnerItem);
    }
  }], [{
    key: 'of',
    value: function of(v) {
      return new Maybe(v);
    }
  }, {
    key: 'ofAny',
    value: function ofAny(v) {
      return new Maybe(v, false);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return Object.freeze({ type: Maybe, reviver: reviverFactory$2(itemMetadata) });
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return Maybe;
}(Base$1);

Maybe.displayName = 'Maybe';
Maybe.EMPTY = Maybe.of();

var Maybe$1 = Object.freeze(Maybe);

var enumeratorsReducer = function enumeratorsReducer(acc, code) {
  return Object.assign(acc, defineProperty({}, code, { code: code }));
};

var reviverFactory$3 = function reviverFactory$3(enumerators) {
  return function (k, v) {
    var enumerator = enumerators[v];

    if (isNothing(enumerator)) {
      throw TypeError('missing enumerator (' + v + ')');
    }

    return enumerator;
  };
};

var Enum = function (_Base) {
  inherits(Enum, _Base);

  function Enum(input) {
    classCallCheck(this, Enum);

    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

    var _this = possibleConstructorReturn(this, (Enum.__proto__ || Object.getPrototypeOf(Enum)).call(this, Enum));

    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
      _this[enumerator] = always(enumerators[enumerator]);
      enumerators[enumerator].toJSON = always(enumerator);
    });

    Object.defineProperty(_this, 'metadata', {
      value: always(Object.freeze({
        type: Enum,
        reviver: reviverFactory$3(enumerators)
      })),
      enumerable: false
    });

    Object.freeze(_this);
    return _this;
  }

  createClass(Enum, null, [{
    key: 'fromObject',
    value: function fromObject(obj) {
      return new Enum(obj);
    }
  }, {
    key: 'fromArray',
    value: function fromArray(arr) {
      return new Enum(arr);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return Enum;
}(Base$1);

Enum.displayName = 'Enum';

var Enum$1 = Object.freeze(Enum);

var set$2 = function set$2(thisArg, Type, key, value) {
  var newMap = thisArg.inner();
  newMap.set(key, value);

  return Type.fromMap(newMap);
};

var of$1 = function of$1(Type, args) {
  var len = args.length;

  if (len % 2 === 1) {
    throw TypeError((Type.displayName || Type.name) + '.of requires an even number of arguments');
  }

  var pairs = [];

  for (var i = 0; i < len; i += 2) {
    pairs.push([args[i], args[i + 1]]);
  }

  return Type.fromArray(pairs);
};

var metadata$2 = function metadata$2(Type, reviver) {
  return Object.freeze({ type: Type, reviver: reviver });
};

var AbstractMap = function (_Base) {
  inherits(AbstractMap, _Base);

  function AbstractMap(Type, innerMapOrig) {
    classCallCheck(this, AbstractMap);

    var _this = possibleConstructorReturn(this, (AbstractMap.__proto__ || Object.getPrototypeOf(AbstractMap)).call(this, Type));

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map');
    }

    var innerMap = new Map(innerMapOrig);

    _this.inner = function () {
      return new Map(innerMap);
    };
    _this[Symbol.iterator] = function () {
      return innerMap[Symbol.iterator]();
    };
    return _this;
  }

  createClass(AbstractMap, [{
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return new (this[typeSymbol]())(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this.inner().get(key);

      if (!item.setPath) {
        return this.set(key, value);
      }

      return this.set(key, item.setPath(restPath, value));
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      var items = [].concat(toConsumableArray(this));
      var otherItems = [].concat(toConsumableArray(other));

      if (items.length !== otherItems.length) {
        return false;
      }

      return items.every(function (item, index) {
        var otherItem = otherItems[index];

        return item.every(function (itemPart, index) {
          return equals$1(itemPart, otherItem[index]);
        });
      });
    }
  }]);
  return AbstractMap;
}(Base$1);

var AbstractMap$1 = Object.freeze(AbstractMap);

var parseMapper = function parseMapper(keyMetadata, valueMetadata) {
  return function (pair) {
    var reviveKey = reviverOrAsIs(keyMetadata);
    var revivedKey = reviveKey('', pair[0]);

    var reviveVal = reviverOrAsIs(valueMetadata);
    var revivedVal = reviveVal('', pair[1]);

    return [revivedKey, revivedVal];
  };
};

var reviverFactory$4 = function reviverFactory$4(keyMetadata, valueMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var innerMap = v === null ? null : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

    return ModelicoMap.fromMap(innerMap);
  };
};

var ModelicoMap = function (_AbstractMap) {
  inherits(ModelicoMap, _AbstractMap);

  function ModelicoMap(innerMap) {
    classCallCheck(this, ModelicoMap);

    var _this = possibleConstructorReturn(this, (ModelicoMap.__proto__ || Object.getPrototypeOf(ModelicoMap)).call(this, ModelicoMap, innerMap));

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoMap, [{
    key: 'set',
    value: function set(key, value) {
      return set$2(this, ModelicoMap, key, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this.inner()));
    }
  }], [{
    key: 'fromMap',
    value: function fromMap(map) {
      return new ModelicoMap(map);
    }
  }, {
    key: 'fromArray',
    value: function fromArray(pairs) {
      return ModelicoMap.fromMap(new Map(pairs));
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return of$1(ModelicoMap, args);
    }
  }, {
    key: 'fromObject',
    value: function fromObject(obj) {
      return ModelicoMap.fromArray(objToArr(obj));
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return metadata$2(ModelicoMap, reviverFactory$4(keyMetadata, valueMetadata));
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return ModelicoMap;
}(AbstractMap$1);

ModelicoMap.displayName = 'ModelicoMap';
ModelicoMap.EMPTY = ModelicoMap.of();

var ModelicoMap$1 = Object.freeze(ModelicoMap);

var stringifyReducer = function stringifyReducer(acc, pair) {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

var parseMapper$1 = function parseMapper$1(keyMetadata, valueMetadata, object) {
  return function (enumerator) {
    var reviveKey = reviverOrAsIs(keyMetadata);
    var key = reviveKey('', enumerator);

    var reviveVal = reviverOrAsIs(valueMetadata);
    var val = reviveVal('', object[enumerator]);

    return [key, val];
  };
};

var reviverFactory$5 = function reviverFactory$5(keyMetadata, valueMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

    return new EnumMap(innerMap);
  };
};

var EnumMap = function (_AbstractMap) {
  inherits(EnumMap, _AbstractMap);

  function EnumMap(innerMap) {
    classCallCheck(this, EnumMap);

    var _this = possibleConstructorReturn(this, (EnumMap.__proto__ || Object.getPrototypeOf(EnumMap)).call(this, EnumMap, innerMap));

    Object.freeze(_this);
    return _this;
  }

  createClass(EnumMap, [{
    key: 'set',
    value: function set(enumerator, value) {
      return set$2(this, EnumMap, enumerator, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this.inner())).reduce(stringifyReducer, {});
    }
  }], [{
    key: 'fromMap',
    value: function fromMap(map) {
      return new EnumMap(map);
    }
  }, {
    key: 'fromArray',
    value: function fromArray(pairs) {
      return EnumMap.fromMap(new Map(pairs));
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return of$1(EnumMap, args);
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return metadata$2(EnumMap, reviverFactory$5(keyMetadata, valueMetadata));
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return EnumMap;
}(AbstractMap$1);

EnumMap.displayName = 'EnumMap';
EnumMap.EMPTY = EnumMap.of();

var EnumMap$1 = Object.freeze(EnumMap);

var reviver = function reviver(k, v) {
  return ModelicoNumber.of(v);
};

var ModelicoNumber = function (_Base) {
  inherits(ModelicoNumber, _Base);

  function ModelicoNumber(number) {
    classCallCheck(this, ModelicoNumber);

    var _this = possibleConstructorReturn(this, (ModelicoNumber.__proto__ || Object.getPrototypeOf(ModelicoNumber)).call(this, ModelicoNumber));

    if (!Number.isNaN(number) && isNothing(number)) {
      throw TypeError('missing number');
    }

    _this.inner = always(Number(number));

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoNumber, [{
    key: 'set',
    value: function set() {
      unsupported('Number.set is not supported');
    }
  }, {
    key: 'setPath',
    value: function setPath(path, number) {
      if (path.length === 0) {
        return ModelicoNumber.of(number);
      }

      unsupported('ModelicoNumber.setPath is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var v = this.inner();

      return Object.is(v, -0) ? '-0' : v === Infinity ? 'Infinity' : v === -Infinity ? '-Infinity' : Number.isNaN(v) ? 'NaN' : v;
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return haveSameValues(this.inner(), other.inner());
    }
  }], [{
    key: 'of',
    value: function of(number) {
      return new ModelicoNumber(number);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return Object.freeze({ type: ModelicoNumber, reviver: reviver });
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return ModelicoNumber;
}(Base$1);

ModelicoNumber.displayName = 'ModelicoNumber';

var ModelicoNumber$1 = Object.freeze(ModelicoNumber);

var reviver$1 = function reviver$1(k, v) {
  var date = v === null ? null : new Date(v);

  return new ModelicoDate(date);
};

var ModelicoDate = function (_Base) {
  inherits(ModelicoDate, _Base);

  function ModelicoDate(dateOrig) {
    classCallCheck(this, ModelicoDate);

    var _this = possibleConstructorReturn(this, (ModelicoDate.__proto__ || Object.getPrototypeOf(ModelicoDate)).call(this, ModelicoDate));

    if (isNothing(dateOrig)) {
      throw TypeError('missing date');
    }

    var date = new Date(dateOrig.getTime());

    _this.inner = function () {
      return new Date(date.getTime());
    };

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoDate, [{
    key: 'set',
    value: function set() {
      unsupported('Date.set is not supported');
    }
  }, {
    key: 'setPath',
    value: function setPath(path, date) {
      if (path.length === 0) {
        return ModelicoDate.of(date);
      }

      unsupported('Date.setPath is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner().toISOString();
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return this.toJSON() === other.toJSON();
    }
  }], [{
    key: 'of',
    value: function of(date) {
      return new ModelicoDate(date);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return Object.freeze({ type: ModelicoDate, reviver: reviver$1 });
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return ModelicoDate;
}(Base$1);

ModelicoDate.displayName = 'ModelicoDate';

var ModelicoDate$1 = Object.freeze(ModelicoDate);

var iterableReviverFactory = function iterableReviverFactory(IterableType, itemMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var revive = partial(reviverOrAsIs(itemMetadata), k);
    var iterable = v === null ? null : v.map(revive);

    return new IterableType(iterable);
  };
};

var iterableMetadata = function iterableMetadata(IterableType, itemMetadata) {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};

var iterableEquals = function iterableEquals(thisArg, other) {
  if (thisArg === other) {
    return true;
  }

  if (haveDifferentTypes(thisArg, other)) {
    return false;
  }

  var items = [].concat(toConsumableArray(thisArg));
  var otherItems = [].concat(toConsumableArray(other));

  if (items.length !== otherItems.length) {
    return false;
  }

  return items.every(function (item, index) {
    return equals$1(item, otherItems[index]);
  });
};

var List = function (_Base) {
  inherits(List, _Base);

  function List(innerListOrig) {
    classCallCheck(this, List);

    var _this = possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, List));

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list');
    }

    var innerList = [].concat(toConsumableArray(innerListOrig));

    _this.inner = function () {
      return [].concat(toConsumableArray(innerList));
    };
    _this[Symbol.iterator] = function () {
      return innerList[Symbol.iterator]();
    };

    Object.freeze(_this);
    return _this;
  }

  createClass(List, [{
    key: 'set',
    value: function set(index, value) {
      var newList = this.inner();
      newList[index] = value;

      return List.fromArray(newList);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return List.fromArray(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this.inner()[key];

      if (!item.setPath) {
        return this.set(key, value);
      }

      return this.set(key, item.setPath(restPath, value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner();
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return iterableEquals(this, other);
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new List(arr);
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
        arr[_key] = arguments[_key];
      }

      return List.fromArray(arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return iterableMetadata(List, itemMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return List;
}(Base$1);

List.displayName = 'List';
List.EMPTY = List.of();

var List$1 = Object.freeze(List);

var ModelicoSet = function (_Base) {
  inherits(ModelicoSet, _Base);

  function ModelicoSet(innerSetOrig) {
    classCallCheck(this, ModelicoSet);

    var _this = possibleConstructorReturn(this, (ModelicoSet.__proto__ || Object.getPrototypeOf(ModelicoSet)).call(this, ModelicoSet));

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set');
    }

    var innerSet = new Set(innerSetOrig);

    _this.inner = function () {
      return new Set(innerSet);
    };
    _this[Symbol.iterator] = function () {
      return innerSet[Symbol.iterator]();
    };

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoSet, [{
    key: 'set',
    value: function set() {
      unsupported('Set.set is not supported');
    }
  }, {
    key: 'setPath',
    value: function setPath(path, set$$1) {
      if (path.length === 0) {
        return new ModelicoSet(set$$1);
      }

      unsupported('Set.setPath is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this.inner()));
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return iterableEquals(this, other);
    }
  }], [{
    key: 'fromSet',
    value: function fromSet(set$$1) {
      return new ModelicoSet(set$$1);
    }
  }, {
    key: 'fromArray',
    value: function fromArray(arr) {
      return ModelicoSet.fromSet(new Set(arr));
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
        arr[_key] = arguments[_key];
      }

      return ModelicoSet.fromArray(arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return iterableMetadata(ModelicoSet, itemMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return ModelicoSet;
}(Base$1);

ModelicoSet.displayName = 'ModelicoSet';
ModelicoSet.EMPTY = ModelicoSet.of();

var ModelicoSet$1 = Object.freeze(ModelicoSet);

var Any = function Any(x) {
  return identity(x);
};

var Any$1 = Object.freeze(Any);

var proxyToSelf = function proxyToSelf(nonMutators, mutators, target, prop) {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return function () {
    var newObj = target[prop].apply(target, arguments);

    return proxyFactory(nonMutators, mutators, newObj);
  };
};

var proxyToInner = function proxyToInner(inner, candidate, nonMutators, mutators, target, prop) {
  if (nonMutators.includes(prop)) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      candidate.apply(inner, args);
      var newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return candidate.apply(inner, args);
  };
};

var proxyFactory = function proxyFactory(nonMutators, mutators, obj) {
  var get = function get(target, prop) {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, target, prop);
    }

    var inner = target.inner();
    var candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, target, prop);
    }

    return candidate;
  };

  return new Proxy(obj, { get: get });
};

var asIs = (function () {
  var Type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Any$1;
  return Object.freeze({ type: Type, reviver: asIsReviver(Type) });
});

var internalNonMutators = ['set', 'setPath'];

var mapNonMutators = internalNonMutators;
var mapMutators = ['set', 'delete', 'clear'];

var setNonMutators = internalNonMutators;
var setMutators = ['add', 'delete', 'clear'];

var listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
var listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

var dateNonMutators = internalNonMutators;
var dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

var _ = function _(Type) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var innerMetadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (Type.metadata) {
    return Type.metadata.apply(Type, toConsumableArray(innerMetadata));
  }

  return Object.freeze({ type: Type, reviver: reviverFactory(depth, Type) });
};

var metadata$1 = Object.freeze({
  _: _,
  asIs: asIs,
  any: always(asIs(Any$1)),
  number: function number() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$wrap = _ref.wrap,
        wrap = _ref$wrap === undefined ? false : _ref$wrap;

    return wrap ? ModelicoNumber$1.metadata() : asIs(Number);
  },

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),
  regExp: always(asIs(RegExp)),
  fn: always(asIs(Function)),

  date: ModelicoDate$1.metadata,
  enumMap: EnumMap$1.metadata,
  list: List$1.metadata,
  map: ModelicoMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata
});

var M = {
  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),
  Any: Any$1,
  Number: ModelicoNumber$1,
  Date: ModelicoDate$1,
  Enum: Enum$1,
  EnumMap: EnumMap$1,
  List: List$1,
  Map: ModelicoMap$1,
  Maybe: Maybe$1,
  Base: Base$1,
  Set: ModelicoSet$1,
  fields: function fields(x) {
    return x[fieldsSymbol]();
  },
  fromJSON: function fromJSON(Type, json) {
    return JSON.parse(json, _(Type).reviver);
  },
  genericsFromJSON: function genericsFromJSON(Type, innerMetadata, json) {
    return JSON.parse(json, _(Type, 0, innerMetadata).reviver);
  },
  metadata: metadata$1,
  proxyMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyEnumMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory, listNonMutators, listMutators),
  proxySet: partial(proxyFactory, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators)
};

return M;

})));
