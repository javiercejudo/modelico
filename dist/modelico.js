(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Modelico = factory());
}(this, function () { 'use strict';

	var version = "15.0.0";
	var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
	var license = "MIT";
	var homepage = "https://github.com/javiercejudo/modelico#readme";

	var typeSymbol = Symbol('type');
	var fieldsSymbol = Symbol('fields');
	var innerTypesSymbol = Symbol('innerTypes');
	var itemMetadataSymbol = Symbol('itemMetadata');

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
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

	var toConsumableArray = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

	    return arr2;
	  } else {
	    return Array.from(arr);
	  }
	};

	var get = function get(field) {
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
	var asIsReviver = function asIsReviver(k, v) {
	  return v;
	};
	var always = function always(x) {
	  return function () {
	    return x;
	  };
	};
	var defaultTo = function defaultTo(fallback) {
	  return function (optional) {
	    return optional === undefined ? fallback : optional;
	  };
	};
	var objToArr = function objToArr(obj) {
	  return Object.keys(obj).map(function (k) {
	    return [k, obj[k]];
	  });
	};
	var reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
	var isPlainObject = function isPlainObject(x) {
	  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x;
	};

	var getInnerTypes = function getInnerTypes(Type) {
	  return Type.innerTypes && Type.innerTypes() || {};
	};

	var reviverFactory = function reviverFactory(Type) {
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

	    var innerTypes = getInnerTypes(Type);

	    thisArg = defaultTo(this)(thisArg);
	    thisArg[typeSymbol] = always(Type);
	    thisArg[fieldsSymbol] = always(Object.freeze(fields));

	    new Set([].concat(toConsumableArray(Object.keys(innerTypes)), toConsumableArray(Object.keys(fields)))).forEach(function (key) {
	      return thisArg[key] = always(fields[key]);
	    });

	    return thisArg;
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

	      if (path.length === 1) {
	        return this.set(path[0], value);
	      }

	      return this.set(path[0], this[path[0]]().setPath(path.slice(1), value));
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
	      return JSON.parse(json, reviverFactory(Type));
	    }
	  }, {
	    key: 'metadata',
	    value: function metadata(Type) {
	      return Object.freeze({ type: Type, reviver: reviverFactory(Type) });
	    }
	  }]);
	  return Modelico;
	}();

	var Modelico$1 = Object.freeze(Modelico);

	var AbstractMap = function (_Modelico) {
	  inherits(AbstractMap, _Modelico);

	  function AbstractMap(Type, keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    classCallCheck(this, AbstractMap);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(AbstractMap).call(this, Type, {}));

	    _this.inner = function () {
	      return innerMap === null ? null : new Map(innerMap);
	    };
	    _this[innerTypesSymbol] = always(Object.freeze({ keyMetadata: keyMetadata, valueMetadata: valueMetadata }));
	    _this[Symbol.iterator] = function () {
	      return innerMap[Symbol.iterator]();
	    };

	    return _ret = _this, possibleConstructorReturn(_this, _ret);
	  }

	  createClass(AbstractMap, [{
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        var _innerTypesSymbol = this[innerTypesSymbol]();

	        var keyMetadata = _innerTypesSymbol.keyMetadata;
	        var valueMetadata = _innerTypesSymbol.valueMetadata;


	        return new (this[typeSymbol]())(keyMetadata, valueMetadata, value);
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
	      var _innerTypesSymbol2 = this[innerTypesSymbol]();

	      var keyMetadata = _innerTypesSymbol2.keyMetadata;
	      var valueMetadata = _innerTypesSymbol2.valueMetadata;

	      var newMap = this.inner();
	      newMap.set(key, value);

	      return new Type(keyMetadata, valueMetadata, newMap);
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
	  return Object.freeze({ type: Type, reviver: asIsReviver });
	});

	var Any = Object.freeze({ name: 'Any' });

	var stringifyMapper = function stringifyMapper(pair) {
	  return { key: pair[0], value: pair[1] };
	};

	var parseMapper = function parseMapper(keyMetadata, valueMetadata) {
	  return function (pairObject) {
	    var reviveKey = reviverOrAsIs(keyMetadata);
	    var key = reviveKey('', pairObject.key);

	    var reviveVal = reviverOrAsIs(valueMetadata);
	    var val = reviveVal('', pairObject.value);

	    return [key, val];
	  };
	};

	var reviverFactory$1 = function reviverFactory(keyMetadata, valueMetadata) {
	  return function (k, v) {
	    if (k !== '') {
	      return v;
	    }

	    var innerMap = v === null ? null : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

	    return new ModelicoMap(keyMetadata, valueMetadata, innerMap);
	  };
	};

	var ModelicoMap = function (_AbstractMap) {
	  inherits(ModelicoMap, _AbstractMap);

	  function ModelicoMap(keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    classCallCheck(this, ModelicoMap);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, keyMetadata, valueMetadata, innerMap));

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
	  }

	  createClass(ModelicoMap, [{
	    key: 'set',
	    value: function set(enumerator, value) {
	      return AbstractMap$1.set.call(this, ModelicoMap, enumerator, value);
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerMap = this.inner();

	      return innerMap === null ? null : [].concat(toConsumableArray(innerMap)).map(stringifyMapper);
	    }
	  }], [{
	    key: 'fromObject',
	    value: function fromObject(obj) {
	      return ModelicoMap.fromMap(new Map(objToArr(obj)));
	    }
	  }, {
	    key: 'fromMap',
	    value: function fromMap(map) {
	      return new ModelicoMap(AsIs(String), AsIs(Any), map);
	    }
	  }, {
	    key: 'metadata',
	    value: function metadata(keyMetadata, valueMetadata) {
	      return AbstractMap$1.metadata(ModelicoMap, reviverFactory$1(keyMetadata, valueMetadata));
	    }
	  }]);
	  return ModelicoMap;
	}(AbstractMap$1);

	var ModelicoMap$1 = Object.freeze(ModelicoMap);

	var stringifyReducer = function stringifyReducer(acc, pair) {
	  acc[pair[0].toJSON()] = pair[1];

	  return acc;
	};

	var parseMapper$1 = function parseMapper(keyMetadata, valueMetadata, object) {
	  return function (enumerator) {
	    var reviveKey = reviverOrAsIs(keyMetadata);
	    var key = reviveKey('', enumerator);

	    var reviveVal = reviverOrAsIs(valueMetadata);
	    var val = reviveVal('', object[enumerator]);

	    return [key, val];
	  };
	};

	var reviverFactory$2 = function reviverFactory(keyMetadata, valueMetadata) {
	  return function (k, v) {
	    if (k !== '') {
	      return v;
	    }

	    var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

	    return new ModelicoEnumMap(keyMetadata, valueMetadata, innerMap);
	  };
	};

	var ModelicoEnumMap = function (_AbstractMap) {
	  inherits(ModelicoEnumMap, _AbstractMap);

	  function ModelicoEnumMap(keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    classCallCheck(this, ModelicoEnumMap);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnumMap).call(this, ModelicoEnumMap, keyMetadata, valueMetadata, innerMap));

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
	  }

	  createClass(ModelicoEnumMap, [{
	    key: 'set',
	    value: function set(enumerator, value) {
	      return AbstractMap$1.set.call(this, ModelicoEnumMap, enumerator, value);
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerMap = this.inner();

	      return innerMap === null ? null : [].concat(toConsumableArray(innerMap)).reduce(stringifyReducer, {});
	    }
	  }], [{
	    key: 'metadata',
	    value: function metadata(keyMetadata, valueMetadata) {
	      return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$2(keyMetadata, valueMetadata));
	    }
	  }]);
	  return ModelicoEnumMap;
	}(AbstractMap$1);

	var EnumMap = Object.freeze(ModelicoEnumMap);

	var ModelicoDate = function (_Modelico) {
	  inherits(ModelicoDate, _Modelico);

	  function ModelicoDate(date) {
	    var _ret;

	    classCallCheck(this, ModelicoDate);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoDate).call(this, ModelicoDate, {}));

	    _this.inner = function () {
	      return date === null ? null : new Date(date.getTime());
	    };

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
	  }

	  createClass(ModelicoDate, [{
	    key: 'set',
	    value: function set(date) {
	      return new ModelicoDate(date);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      return this.set(value);
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var date = this.inner();

	      return date === null ? null : date.toISOString();
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

	    return new IterableType(itemMetadata, iterable);
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

	  function ModelicoList(itemMetadata, inner) {
	    var _ret;

	    classCallCheck(this, ModelicoList);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, {}));

	    _this[itemMetadataSymbol] = always(itemMetadata);
	    _this.inner = function () {
	      return inner === null ? null : inner.slice();
	    };
	    _this[Symbol.iterator] = function () {
	      return inner[Symbol.iterator]();
	    };

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
	  }

	  createClass(ModelicoList, [{
	    key: 'set',
	    value: function set(index, value) {
	      var newList = this.inner();
	      newList[index] = value;

	      return new ModelicoList(this[itemMetadataSymbol](), newList);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        return new ModelicoList(this[itemMetadataSymbol](), value);
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
	      return new ModelicoList(AsIs(Any), arr);
	    }
	  }, {
	    key: 'metadata',
	    value: function metadata(itemMetadata) {
	      return iterableMetadata(ModelicoList, itemMetadata);
	    }
	  }]);
	  return ModelicoList;
	}(Modelico$1);

	var List = Object.freeze(ModelicoList);

	var ModelicoSet = function (_Modelico) {
	  inherits(ModelicoSet, _Modelico);

	  function ModelicoSet(itemMetadata, innerSet) {
	    var _ret;

	    classCallCheck(this, ModelicoSet);

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoSet).call(this, ModelicoSet, {}));

	    _this[itemMetadataSymbol] = always(itemMetadata);
	    _this.inner = function () {
	      return innerSet === null ? null : new Set(innerSet);
	    };
	    _this[Symbol.iterator] = function () {
	      return innerSet[Symbol.iterator]();
	    };

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
	  }

	  createClass(ModelicoSet, [{
	    key: 'set',
	    value: function set(index, value) {
	      var newSet = [].concat(toConsumableArray(this.inner()));
	      newSet[index] = value;

	      return new ModelicoSet(this[itemMetadataSymbol](), newSet);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        return new ModelicoSet(this[itemMetadataSymbol](), value);
	      }

	      var item = [].concat(toConsumableArray(this.inner()))[path[0]];

	      if (!item.setPath) {
	        return this.set(path[0], value);
	      }

	      return this.set(path[0], item.setPath(path.slice(1), value));
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerSet = this.inner();

	      return innerSet === null ? null : [].concat(toConsumableArray(innerSet));
	    }
	  }], [{
	    key: 'fromArray',
	    value: function fromArray(arr) {
	      return ModelicoSet.fromSet(new Set(arr));
	    }
	  }, {
	    key: 'fromSet',
	    value: function fromSet(set) {
	      return new ModelicoSet(AsIs(Any), set);
	    }
	  }, {
	    key: 'metadata',
	    value: function metadata(itemMetadata) {
	      return iterableMetadata(ModelicoSet, itemMetadata);
	    }
	  }]);
	  return ModelicoSet;
	}(Modelico$1);

	var ModelicoSet$1 = Object.freeze(ModelicoSet);

	var enumeratorsReducer = function enumeratorsReducer(acc, code) {
	  return (acc[code] = { code: code }) && acc;
	};

	var reviverFactory$3 = function reviverFactory(enumerators) {
	  return function (k, v) {
	    return v === null ? null : enumerators[v];
	  };
	};

	var ModelicoEnum = function (_Modelico) {
	  inherits(ModelicoEnum, _Modelico);

	  function ModelicoEnum(input) {
	    var _ret;

	    classCallCheck(this, ModelicoEnum);

	    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

	    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnum).call(this, ModelicoEnum, enumerators));

	    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
	      return _this[enumerator]().toJSON = always(enumerator);
	    });

	    _this.metadata = always(Object.freeze({
	      type: ModelicoEnum,
	      reviver: reviverFactory$3(enumerators)
	    }));

	    return _ret = Object.freeze(_this), possibleConstructorReturn(_this, _ret);
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

	var index = Object.freeze({
	  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),
	  Any: Any,
	  AsIs: AsIs,
	  Date: ModelicoDate$1,
	  Enum: Enum,
	  EnumMap: EnumMap,
	  List: List,
	  Map: ModelicoMap$1,
	  Modelico: Modelico$1,
	  Set: ModelicoSet$1,
	  fields: function fields(x) {
	    return x[fieldsSymbol]();
	  },
	  proxyMap: partial(proxyFactory$1, mapNonMutators, mapMutators),
	  proxyList: partial(proxyFactory$1, listNonMutators, listMutators),
	  proxySet: partial(proxyFactory$1, setNonMutators, setMutators),
	  proxyDate: partial(proxyFactory$1, dateNonMutators, dateMutators)
	});

	return index;

}));