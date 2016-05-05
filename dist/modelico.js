(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Modelico = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
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

	babelHelpers.defineProperty = function (obj, key, value) {
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

	babelHelpers.inherits = function (subClass, superClass) {
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

	babelHelpers.possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	babelHelpers;

	var version = "12.6.0";
	var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
	var license = "MIT";
	var homepage = "https://github.com/javiercejudo/modelico#readme";

	var asIsReviver = function asIsReviver(k, v) {
	  return v;
	};
	var bind = function bind(fn, _1) {
	  return fn.bind(undefined, _1);
	};

	var iterableReviver = function iterableReviver(IterableType, itemMetadata, k, v) {
	  if (k !== '') {
	    return v;
	  }

	  var iterable = v === null ? null : v.map(bind(itemMetadata.reviver, k));

	  return new IterableType(itemMetadata, iterable);
	};

	var iterableMetadata = function iterableMetadata(IterableType, itemMetadata, k, v) {
	  return Object.freeze({
	    type: IterableType,
	    reviver: iterableReviver.bind(undefined, IterableType, itemMetadata)
	  });
	};

	var always = function always(x) {
	  return function () {
	    return x;
	  };
	};
	var defaultTo = function defaultTo(fallback, optional) {
	  return optional === undefined ? fallback : optional;
	};
	var objToArr = function objToArr(obj) {
	  return Object.keys(obj).map(function (k) {
	    return [k, obj[k]];
	  });
	};
	var reviverOrAsIs = function reviverOrAsIs(metadata) {
	  return metadata.reviver || asIsReviver;
	};

	var mergeDeepInnerTypes = function mergeDeepInnerTypes(acc, Type) {
	  if (!Type.innerTypes) {
	    return acc;
	  }

	  var innerTypes = Type.innerTypes();

	  var result = Object.keys(innerTypes).reduce(function (localAcc, key) {
	    localAcc = mergeDeepInnerTypes(acc, innerTypes[key].type);

	    if (localAcc.hasOwnProperty(key) && acc[key].type.name !== innerTypes[key].type.name) {
	      throw new TypeError('Duplicated typed key \'' + key + '\' with types ' + acc[key].type.name + ' and ' + innerTypes[key].type.name);
	    }

	    localAcc[key] = innerTypes[key];

	    return localAcc;
	  }, {});

	  return result;
	};

	var reviverFactory = function reviverFactory(Type) {
	  var innerTypes = mergeDeepInnerTypes({}, Type);

	  return function (k, v) {
	    if (k === '') {
	      return new Type(v);
	    }

	    var innerTypeMetadata = innerTypes[k];

	    if (innerTypeMetadata) {
	      return reviverOrAsIs(innerTypeMetadata)('', v);
	    }

	    return v;
	  };
	};

	var Modelico$1 = function () {
	  function Modelico(Type, fields, thisArg) {
	    babelHelpers.classCallCheck(this, Modelico);

	    thisArg = defaultTo(this, thisArg);
	    thisArg.type = always(Type);
	    thisArg.fields = always(Object.freeze(fields));

	    Object.getOwnPropertyNames(fields).forEach(function (field) {
	      return thisArg[field] = always(fields[field]);
	    });

	    return thisArg;
	  }

	  babelHelpers.createClass(Modelico, [{
	    key: 'set',
	    value: function set(field, value) {
	      var newFields = Object.assign({}, this.fields(), babelHelpers.defineProperty({}, field, value));

	      return new (this.type())(newFields);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        return new (this.type())(value);
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
	      return this.fields();
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

	var Modelico$2 = Object.freeze(Modelico$1);

	var AbstractMap = function (_Modelico) {
	  babelHelpers.inherits(AbstractMap, _Modelico);

	  function AbstractMap(Type, keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    babelHelpers.classCallCheck(this, AbstractMap);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AbstractMap).call(this, Type, { innerMap: innerMap }));

	    _this.innerTypes = always(Object.freeze({ keyMetadata: keyMetadata, valueMetadata: valueMetadata }));
	    _this.innerMap = function () {
	      return innerMap === null ? null : new Map(innerMap);
	    };
	    _this[Symbol.iterator] = function () {
	      return innerMap[Symbol.iterator]();
	    };

	    return _ret = _this, babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(AbstractMap, [{
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        var innerTypes = this.innerTypes();

	        return new (this.type())(innerTypes.keyMetadata, innerTypes.keyMetadata, value);
	      }

	      var item = this.innerMap().get(path[0]);
	      return this.set(path[0], item.setPath(path.slice(1), value));
	    }

	    // as static to support IE < 11

	  }], [{
	    key: 'set',
	    value: function set(Type, key, value) {
	      var innerTypes = this.innerTypes();
	      var newMap = this.innerMap();
	      newMap.set(key, value);

	      return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
	    }
	  }, {
	    key: 'metadata',
	    value: function metadata(Type, reviverFactory, keyMetadata, valueMetadata) {
	      return Object.freeze({ type: Type, reviver: reviverFactory({ keyMetadata: keyMetadata, valueMetadata: valueMetadata }) });
	    }
	  }]);
	  return AbstractMap;
	}(Modelico$2);

	var AbstractMap$1 = Object.freeze(AbstractMap);

	var AsIs = (function (Type) {
	  return Object.freeze({ type: Type, reviver: asIsReviver });
	})

	var Any = Object.freeze({ name: 'Any' });

	var stringifyMapper = function stringifyMapper(pair) {
	  return { key: pair[0], value: pair[1] };
	};

	var parseMapper = function parseMapper(innerTypes) {
	  return function (pairObject) {
	    return [reviverOrAsIs(innerTypes.keyMetadata)('', pairObject.key), reviverOrAsIs(innerTypes.valueMetadata)('', pairObject.value)];
	  };
	};

	var reviverFactory$1 = function reviverFactory(innerTypes) {
	  return function (k, v) {
	    if (k !== '') {
	      return v;
	    }

	    var innerMap = v === null ? null : new Map(v.map(parseMapper(innerTypes)));

	    return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
	  };
	};

	var ModelicoMap = function (_AbstractMap) {
	  babelHelpers.inherits(ModelicoMap, _AbstractMap);

	  function ModelicoMap(keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoMap);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoMap).call(this, ModelicoMap, keyMetadata, valueMetadata, innerMap));

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(ModelicoMap, [{
	    key: 'set',
	    value: function set(enumerator, value) {
	      return AbstractMap$1.set.call(this, ModelicoMap, enumerator, value);
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerMap = this.fields().innerMap;

	      return innerMap === null ? null : Array.from(innerMap).map(stringifyMapper);
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
	      return AbstractMap$1.metadata(ModelicoMap, reviverFactory$1, keyMetadata, valueMetadata);
	    }
	  }]);
	  return ModelicoMap;
	}(AbstractMap$1);

	var ModelicoMap$1 = Object.freeze(ModelicoMap);

	var stringifyReducer = function stringifyReducer(acc, pair) {
	  acc[pair[0].toJSON()] = pair[1];

	  return acc;
	};

	var parseMapper$1 = function parseMapper(innerTypes, object) {
	  return function (enumerator) {
	    return [reviverOrAsIs(innerTypes.keyMetadata)('', enumerator), reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])];
	  };
	};

	var reviverFactory$2 = function reviverFactory(innerTypes) {
	  return function (k, v) {
	    if (k !== '') {
	      return v;
	    }

	    var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper$1(innerTypes, v)));

	    return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
	  };
	};

	var ModelicoEnumMap = function (_AbstractMap) {
	  babelHelpers.inherits(ModelicoEnumMap, _AbstractMap);

	  function ModelicoEnumMap(keyMetadata, valueMetadata, innerMap) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoEnumMap);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnumMap).call(this, ModelicoEnumMap, keyMetadata, valueMetadata, innerMap));

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(ModelicoEnumMap, [{
	    key: 'set',
	    value: function set(enumerator, value) {
	      return AbstractMap$1.set.call(this, ModelicoEnumMap, enumerator, value);
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerMap = this.fields().innerMap;

	      return innerMap === null ? null : Array.from(innerMap).reduce(stringifyReducer, {});
	    }
	  }], [{
	    key: 'metadata',
	    value: function metadata(keyMetadata, valueMetadata) {
	      return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$2, keyMetadata, valueMetadata);
	    }
	  }]);
	  return ModelicoEnumMap;
	}(AbstractMap$1);

	var EnumMap = Object.freeze(ModelicoEnumMap);

	var ModelicoDate = function (_Modelico) {
	  babelHelpers.inherits(ModelicoDate, _Modelico);

	  function ModelicoDate(date) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoDate);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoDate).call(this, ModelicoDate, { date: date }));

	    _this.date = function () {
	      return date === null ? null : new Date(date.getTime());
	    };

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(ModelicoDate, [{
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
	      return this.date() === null ? null : this.date().toISOString();
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
	}(Modelico$2);

	var ModelicoDate$1 = Object.freeze(ModelicoDate);

	var ModelicoList = function (_Modelico) {
	  babelHelpers.inherits(ModelicoList, _Modelico);

	  function ModelicoList(itemMetadata, innerList) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoList);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoList).call(this, ModelicoList, { innerList: innerList }));

	    _this.itemMetadata = always(itemMetadata);
	    _this.innerList = function () {
	      return innerList === null ? null : innerList.slice();
	    };
	    _this[Symbol.iterator] = function () {
	      return innerList[Symbol.iterator]();
	    };

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(ModelicoList, [{
	    key: 'set',
	    value: function set(index, value) {
	      var newList = this.innerList();
	      newList[index] = value;

	      return new ModelicoList(this.itemMetadata(), newList);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        return new ModelicoList(this.itemMetadata(), value);
	      }

	      var item = this.innerList()[path[0]];

	      return this.set(path[0], item.setPath(path.slice(1), value));
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      return this.fields().innerList;
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
	}(Modelico$2);

	var List = Object.freeze(ModelicoList);

	var ModelicoSet = function (_Modelico) {
	  babelHelpers.inherits(ModelicoSet, _Modelico);

	  function ModelicoSet(itemMetadata, innerSet) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoSet);

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoSet).call(this, ModelicoSet, { innerSet: innerSet }));

	    _this.itemMetadata = always(itemMetadata);
	    _this.innerSet = function () {
	      return innerSet === null ? null : new Set(innerSet);
	    };
	    _this[Symbol.iterator] = function () {
	      return innerSet[Symbol.iterator]();
	    };

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  babelHelpers.createClass(ModelicoSet, [{
	    key: 'set',
	    value: function set(index, value) {
	      var newSet = Array.from(this.innerSet());
	      newSet[index] = value;

	      return new ModelicoSet(this.itemMetadata(), newSet);
	    }
	  }, {
	    key: 'setPath',
	    value: function setPath(path, value) {
	      if (path.length === 0) {
	        return new ModelicoSet(this.itemMetadata(), value);
	      }

	      var item = Array.from(this.innerSet())[path[0]];

	      return this.set(path[0], item.setPath(path.slice(1), value));
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var innerSet = this.fields().innerSet;

	      return innerSet === null ? null : Array.from(innerSet);
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
	}(Modelico$2);

	var ModelicoSet$1 = Object.freeze(ModelicoSet);

	var enumeratorsReducer = function enumeratorsReducer(acc, code) {
	  return (acc[code] = { code: code }) && acc;
	};

	var reviver = function reviver(values, k, v) {
	  return v === null ? null : values[v];
	};

	var ModelicoEnum = function (_Modelico) {
	  babelHelpers.inherits(ModelicoEnum, _Modelico);

	  function ModelicoEnum(input) {
	    var _ret;

	    babelHelpers.classCallCheck(this, ModelicoEnum);

	    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

	    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModelicoEnum).call(this, ModelicoEnum, enumerators));

	    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
	      return _this[enumerator]().toJSON = always(enumerator);
	    });

	    _this.metadata = always(Object.freeze({
	      type: ModelicoEnum,
	      reviver: bind(reviver, enumerators)
	    }));

	    return _ret = Object.freeze(_this), babelHelpers.possibleConstructorReturn(_this, _ret);
	  }

	  return ModelicoEnum;
	}(Modelico$2);

	var Enum = Object.freeze(ModelicoEnum);

	// as `let` to prevent jshint from thinking we are using it before being declared,
	// which is not the case

	var proxyFactory = void 0;

	var proxyToSelf = function proxyToSelf(nonMutators, mutators, innerAccessor, target, prop) {
	  if (!nonMutators.includes(prop)) {
	    return target[prop];
	  }

	  return function () {
	    var newObj = target[prop].apply(target, arguments);

	    return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
	  };
	};

	var proxyToInner = function proxyToInner(inner, candidate, nonMutators, mutators, innerAccessor, target, prop) {
	  if (nonMutators.includes(prop)) {
	    return function () {
	      var newObj = target.setPath([], candidate.apply(inner, arguments));

	      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
	    };
	  }

	  if (mutators.includes(prop)) {
	    return function () {
	      candidate.apply(inner, arguments);
	      var newObj = target.setPath([], inner);

	      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
	    };
	  }

	  return function () {
	    return candidate.apply(inner, arguments);
	  };
	};

	proxyFactory = function proxyFactory(nonMutators, mutators, innerAccessor, obj) {
	  var get = function get(target, prop) {
	    if (prop in target) {
	      return proxyToSelf(nonMutators, mutators, innerAccessor, target, prop);
	    }

	    var inner = target[innerAccessor]();
	    var candidate = inner[prop];

	    if (typeof candidate === 'function') {
	      return proxyToInner(inner, candidate, nonMutators, mutators, innerAccessor, target, prop);
	    }

	    return candidate;
	  };

	  // not using shortcut get due to https://github.com/nodejs/node/issues/4237
	  return new Proxy(obj, { get: get });
	};

	var proxyFactory$1 = proxyFactory;

	var bind3 = function bind3(fn, _1, _2, _3) {
	  return fn.bind(undefined, _1, _2, _3);
	};
	var internalNonMutators = ['set', 'setPath'];

	var mapNonMutatorMethods = internalNonMutators;
	var mapMutatorMethods = ["set", "delete", "clear"];

	var setNonMutatorMethods = internalNonMutators;
	var setMutatorMethods = ["add", "delete", "clear"];

	var listNonMutatorMethods = internalNonMutators.concat(["concat", "slice", "filter"]);
	var listMutatorMethods = ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];

	var dateNonMutatorMethods = internalNonMutators;
	var dateMutatorMethods = ["setDate", "setFullYear", "setHours", "setMinutes", "setMilliseconds", "setMonth", "setSeconds", "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setYear"];

	var Modelico = Object.freeze({
	  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),
	  Any: Any,
	  AsIs: AsIs,
	  Date: ModelicoDate$1,
	  Enum: Enum,
	  EnumMap: EnumMap,
	  List: List,
	  Map: ModelicoMap$1,
	  Modelico: Modelico$2,
	  Set: ModelicoSet$1,
	  proxyMap: bind3(proxyFactory$1, mapNonMutatorMethods, mapMutatorMethods, 'innerMap'),
	  proxyList: bind3(proxyFactory$1, listNonMutatorMethods, listMutatorMethods, 'innerList'),
	  proxySet: bind3(proxyFactory$1, setNonMutatorMethods, setMutatorMethods, 'innerSet'),
	  proxyDate: bind3(proxyFactory$1, dateNonMutatorMethods, dateMutatorMethods, 'date')
	});

	return Modelico;

}));