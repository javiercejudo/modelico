(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Modelico = factory());
}(this, (function () { 'use strict';

var version = "17.0.0";





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

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
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



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
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

//      

var get$$1 = function get$$1(field) {
  return function (obj) {
    return obj[field];
  };
};
var pipe2 = function pipe2(fn1, fn2) {
  return function () {
    return fn2(fn1.apply(undefined, arguments));
  };
};


var partial = function partial(fn) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return fn.bind.apply(fn, [undefined].concat(args));
};
// export const is = (Ctor: Object, val: Object) => val != null && val.constructor === Ctor || val instanceof Ctor;
var asIsReviver = function asIsReviver(Type) {
  return function (k, v) {
    return Type(v);
  };
};
var identity = function identity(x) {
  return x;
};
var always = function always(x) {
  return function () {
    return x;
  };
};
var isNothing = function isNothing(v) {
  return v == null || v !== v;
};
var defaultTo = function defaultTo(d) {
  return function (v) {
    return isNothing(v) ? d : v;
  };
};
var objToArr = function objToArr(obj) {
  return Object.keys(obj).map(function (k) {
    return [k, obj[k]];
  });
};
var reviverOrAsIs = pipe2(get$$1('reviver'), defaultTo(asIsReviver(identity)));
var isPlainObject = function isPlainObject(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x;
};

var unsupported = function unsupported() {
  var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Unsupported operation';

  throw Error(message);
};

var getInnerTypes = function getInnerTypes(Type) {
  return Type.innerTypes && Type.innerTypes() || {};
};

var reviverFactory$1 = function reviverFactory$1(Type) {
  var innerTypes = getInnerTypes(Type);

  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var fields = !isPlainObject(v) ? v : Object.keys(v).reduce(function (acc, field) {
      var metadata = innerTypes[field];

      if (metadata) {
        acc[field] = reviverOrAsIs(metadata)(k, v[field]);
      } else {
        acc[field] = v[field];
      }

      return acc;
    }, {});

    return new Type(fields);
  };
};

var Modelico = function () {
  function Modelico(Type, fields, thisArg) {
    classCallCheck(this, Modelico);

    if (!isPlainObject(fields)) {
      throw TypeError('expected an object with fields for ' + Type.name + ' but got ' + fields);
    }

    Object.freeze(fields);

    var innerTypes = getInnerTypes(Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(fields);

    new Set([].concat(toConsumableArray(Object.keys(innerTypes)), toConsumableArray(Object.keys(fields)))).forEach(function (key) {
      var valueCandidate = fields[key];
      var innerType = innerTypes[key];
      var value = valueCandidate;

      if (isNothing(valueCandidate) && innerType) {
        if (innerType.type !== Maybe$1) {
          throw TypeError('no value for key ' + key);
        }

        value = Maybe$1.of(null);
      }

      thisArg[key] = always(value);
    });
  }

  createClass(Modelico, [{
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

      var item = this[path[0]]();

      if (!item.setPath) {
        return this.set(path[0], value);
      }

      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return JSON.stringify(this) === JSON.stringify(other);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this[fieldsSymbol]();
    }
  }], [{
    key: 'factory',
    value: function factory(Type, fields, thisArg) {
      return new Modelico(Type, fields, thisArg);
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(Type, json) {
      return JSON.parse(json, reviverFactory$1(Type));
    }
  }, {
    key: 'metadata',
    value: function metadata(Type) {
      return Object.freeze({ type: Type, reviver: reviverFactory$1(Type) });
    }
  }]);
  return Modelico;
}();

var Modelico$1 = Object.freeze(Modelico);

var reviverFactory = function reviverFactory(itemMetadata) {
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

      return v.toJSON ? v.toJSON() : v;
    }
  }]);
  return Just;
}();

var nothing = new Nothing();

var Maybe = function (_Modelico) {
  inherits(Maybe, _Modelico);

  function Maybe(v) {
    classCallCheck(this, Maybe);

    var _this = possibleConstructorReturn(this, (Maybe.__proto__ || Object.getPrototypeOf(Maybe)).call(this, Maybe, {}));

    var inner = isNothing(v) ? nothing : new Just(v);
    _this.inner = always(inner);

    Object.freeze(_this);
    return _this;
  }

  createClass(Maybe, [{
    key: 'set',
    value: function set(field, v) {
      if (this.isEmpty()) {
        return new Maybe(null);
      }

      var item = this.inner().get();

      return new Maybe(item.set(field, v));
    }
  }, {
    key: 'setPath',
    value: function setPath(path, v) {
      if (path.length === 0) {
        return new Maybe(v);
      }

      if (this.isEmpty()) {
        return new Maybe(null);
      }

      var item = this.inner().get();
      var inner = item.setPath ? item.setPath(path, v) : v;

      return new Maybe(inner);
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
      var v = this.isEmpty() ? null : f(this.inner().get());

      return new Maybe(v);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner().toJSON();
    }
  }], [{
    key: 'of',
    value: function of(v) {
      return new Maybe(v);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return Object.freeze({ type: Maybe, reviver: reviverFactory(itemMetadata) });
    }
  }]);
  return Maybe;
}(Modelico$1);

var Maybe$1 = Object.freeze(Maybe);

var AbstractMap = function (_Modelico) {
  inherits(AbstractMap, _Modelico);

  function AbstractMap(Type, innerMapOrig) {
    classCallCheck(this, AbstractMap);

    var _this = possibleConstructorReturn(this, (AbstractMap.__proto__ || Object.getPrototypeOf(AbstractMap)).call(this, Type, {}));

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

      var item = this.inner().get(path[0]);

      if (!item.setPath) {
        return this.set(path[0], value);
      }

      return this.set(path[0], item.setPath(path.slice(1), value));
    }

    // as static to support IE < 11

  }], [{
    key: 'set',
    value: function set(Type, key, value) {
      var newMap = this.inner();
      newMap.set(key, value);

      return new Type(newMap);
    }
  }, {
    key: 'metadata',
    value: function metadata(Type, reviver) {
      return Object.freeze({ type: Type, reviver: reviver });
    }
  }]);
  return AbstractMap;
}(Modelico$1);

var AbstractMap$1 = Object.freeze(AbstractMap);

var AsIs = (function (Type) {
  return Object.freeze({ type: Type, reviver: asIsReviver(Type) });
});

var Any = function Any(x) {
  return identity(x);
};

// Any.name = 'Any';

var Any$1 = Object.freeze(Any);

var parseMapper = function parseMapper(keyMetadata, valueMetadata) {
  return function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    var reviveKey = reviverOrAsIs(keyMetadata);
    var revivedKey = reviveKey('', key);

    var reviveVal = reviverOrAsIs(valueMetadata);
    var revivedVal = reviveVal('', value);

    return [revivedKey, revivedVal];
  };
};

var reviverFactory$2 = function reviverFactory$2(keyMetadata, valueMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var innerMap = v === null ? null : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

    return new ModelicoMap(innerMap);
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
      return AbstractMap$1.set.call(this, ModelicoMap, key, value);
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
      var len = arguments.length;

      if (len % 2 === 1) {
        throw TypeError('Map.of requires an even number of arguments');
      }

      var pairs = [];

      for (var i = 0; i < len; i += 2) {
        pairs.push([arguments.length <= i ? undefined : arguments[i], arguments.length <= i + 1 ? undefined : arguments[i + 1]]);
      }

      return ModelicoMap.fromArray(pairs);
    }
  }, {
    key: 'fromObject',
    value: function fromObject(obj) {
      return ModelicoMap.fromArray(objToArr(obj));
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return AbstractMap$1.metadata(ModelicoMap, reviverFactory$2(keyMetadata, valueMetadata));
    }
  }]);
  return ModelicoMap;
}(AbstractMap$1);

ModelicoMap.EMPTY = ModelicoMap.fromArray([]);

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

var reviverFactory$3 = function reviverFactory$3(keyMetadata, valueMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

    return new ModelicoEnumMap(innerMap);
  };
};

var ModelicoEnumMap = function (_AbstractMap) {
  inherits(ModelicoEnumMap, _AbstractMap);

  function ModelicoEnumMap(innerMap) {
    classCallCheck(this, ModelicoEnumMap);

    var _this = possibleConstructorReturn(this, (ModelicoEnumMap.__proto__ || Object.getPrototypeOf(ModelicoEnumMap)).call(this, ModelicoEnumMap, innerMap));

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoEnumMap, [{
    key: 'set',
    value: function set(enumerator, value) {
      return AbstractMap$1.set.call(this, ModelicoEnumMap, enumerator, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this.inner())).reduce(stringifyReducer, {});
    }
  }], [{
    key: 'fromMap',
    value: function fromMap(map) {
      return new ModelicoEnumMap(map);
    }
  }, {
    key: 'metadata',
    value: function metadata(keyMetadata, valueMetadata) {
      return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$3(keyMetadata, valueMetadata));
    }
  }]);
  return ModelicoEnumMap;
}(AbstractMap$1);

ModelicoEnumMap.EMPTY = ModelicoEnumMap.fromMap(new Map([]));

var EnumMap = Object.freeze(ModelicoEnumMap);

var ModelicoDate = function (_Modelico) {
  inherits(ModelicoDate, _Modelico);

  function ModelicoDate(dateOrig) {
    classCallCheck(this, ModelicoDate);

    var _this = possibleConstructorReturn(this, (ModelicoDate.__proto__ || Object.getPrototypeOf(ModelicoDate)).call(this, ModelicoDate, {}));

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
        return new ModelicoDate(date);
      }

      unsupported('Date.setPath is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner().toISOString();
    }
  }], [{
    key: 'reviver',
    value: function reviver(k, v) {
      var date = v === null ? null : new Date(v);

      return new ModelicoDate(date);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return Object.freeze({ type: ModelicoDate, reviver: ModelicoDate.reviver });
    }
  }]);
  return ModelicoDate;
}(Modelico$1);

var ModelicoDate$1 = Object.freeze(ModelicoDate);

var iterableReviverFactory = function iterableReviverFactory(IterableType, itemMetadata) {
  return function (k, v) {
    if (k !== '') {
      return v;
    }

    var revive = partial(itemMetadata.reviver, k);
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

var ModelicoList = function (_Modelico) {
  inherits(ModelicoList, _Modelico);

  function ModelicoList(innerListOrig) {
    classCallCheck(this, ModelicoList);

    var _this = possibleConstructorReturn(this, (ModelicoList.__proto__ || Object.getPrototypeOf(ModelicoList)).call(this, ModelicoList, {}));

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

  createClass(ModelicoList, [{
    key: 'set',
    value: function set(index, value) {
      var newList = this.inner();
      newList[index] = value;

      return new ModelicoList(newList);
    }
  }, {
    key: 'setPath',
    value: function setPath(path, value) {
      if (path.length === 0) {
        return new ModelicoList(value);
      }

      var item = this.inner()[path[0]];

      if (!item.setPath) {
        return this.set(path[0], value);
      }

      return this.set(path[0], item.setPath(path.slice(1), value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner();
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new ModelicoList(arr);
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
        arr[_key] = arguments[_key];
      }

      return ModelicoList.fromArray(arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return iterableMetadata(ModelicoList, itemMetadata);
    }
  }]);
  return ModelicoList;
}(Modelico$1);

ModelicoList.EMPTY = ModelicoList.of();

var List = Object.freeze(ModelicoList);

var ModelicoSet = function (_Modelico) {
  inherits(ModelicoSet, _Modelico);

  function ModelicoSet(innerSetOrig) {
    classCallCheck(this, ModelicoSet);

    var _this = possibleConstructorReturn(this, (ModelicoSet.__proto__ || Object.getPrototypeOf(ModelicoSet)).call(this, ModelicoSet, {}));

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
  }]);
  return ModelicoSet;
}(Modelico$1);

ModelicoSet.EMPTY = ModelicoSet.of();

var ModelicoSet$1 = Object.freeze(ModelicoSet);

var enumeratorsReducer = function enumeratorsReducer(acc, code) {
  return Object.assign(acc, defineProperty({}, code, { code: code }));
};

var reviverFactory$4 = function reviverFactory$4(enumerators) {
  return function (k, v) {
    var enumerator = enumerators[v];

    if (isNothing(enumerator)) {
      throw TypeError('missing enumerator (' + v + ')');
    }

    return enumerator;
  };
};

var ModelicoEnum = function (_Modelico) {
  inherits(ModelicoEnum, _Modelico);

  function ModelicoEnum(input) {
    classCallCheck(this, ModelicoEnum);

    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

    var _this = possibleConstructorReturn(this, (ModelicoEnum.__proto__ || Object.getPrototypeOf(ModelicoEnum)).call(this, ModelicoEnum, enumerators));

    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
      return _this[enumerator]().toJSON = always(enumerator);
    });

    Object.defineProperty(_this, 'metadata', {
      value: always(Object.freeze({
        type: ModelicoEnum,
        reviver: reviverFactory$4(enumerators)
      })),
      enumerable: false
    });

    Object.freeze(_this);
    return _this;
  }

  return ModelicoEnum;
}(Modelico$1);

var Enum = Object.freeze(ModelicoEnum);

// as `let` to prevent jshint from thinking we are using it before being declared,
// which is not the case

var proxyFactory = void 0;

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

proxyFactory = function proxyFactory(nonMutators, mutators, obj) {
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

var proxyFactory$1 = proxyFactory;

var internalNonMutators = ['set', 'setPath'];

var mapNonMutators = internalNonMutators;
var mapMutators = ['set', 'delete', 'clear'];

var setNonMutators = internalNonMutators;
var setMutators = ['add', 'delete', 'clear'];

var listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
var listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

var dateNonMutators = internalNonMutators;
var dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

var metadata$1 = Object.freeze({
  _: Modelico$1.metadata,
  any: Any$1,
  asIs: AsIs,
  date: ModelicoDate$1.metadata,
  enumMap: EnumMap.metadata,
  list: List.metadata,
  map: ModelicoMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata
});

var index = Object.freeze({
  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),
  Any: Any$1,
  AsIs: AsIs,
  Date: ModelicoDate$1,
  Enum: Enum,
  EnumMap: EnumMap,
  List: List,
  Map: ModelicoMap$1,
  Maybe: Maybe$1,
  Modelico: Modelico$1,
  Set: ModelicoSet$1,
  fields: function fields(x) {
    return x[fieldsSymbol]();
  },
  metadata: metadata$1,
  proxyMap: partial(proxyFactory$1, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory$1, listNonMutators, listMutators),
  proxySet: partial(proxyFactory$1, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory$1, dateNonMutators, dateMutators)
});

return index;

})));
