(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('immutable')) :
	typeof define === 'function' && define.amd ? define(['immutable'], factory) :
	(function() {
		var current = global.Modelico;
		var exports = factory(global.Immutable);
		global.Modelico = exports;
		exports.noConflict = function() { global.Modelico = current; return exports; };
	})();
}(this, (function (immutable) { 'use strict';

var version = "23.0.0";






var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico/tree/immutable-js#readme";

var typeSymbol = Symbol('type');
var fieldsSymbol = Symbol('fields');
var innerOrigSymbol = Symbol('innerOrig');

var symbols = Object.freeze({
	typeSymbol: typeSymbol,
	fieldsSymbol: fieldsSymbol,
	innerOrigSymbol: innerOrigSymbol
});

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

var get$$1 = function get$$1(field) {
  return function (obj) {
    return obj[field];
  };
};
var pipe2 = function pipe2(f, g) {
  return function () {
    return g(f.apply(undefined, arguments));
  };
};

var not = function not(x) {
  return !x;
};

var T = function T() {
  return true;
};
var identity = function identity(x) {
  return x;
};

var pipe = function pipe() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return [].concat(fns, [identity]).reduce(pipe2);
};

var partial = function partial(fn) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return fn.bind.apply(fn, [undefined].concat(args));
};

var asIsReviver = function asIsReviver(transform) {
  return function (k, v) {
    return transform(v);
  };
};

var always = function always(x) {
  return function () {
    return x;
  };
};

var isNothing = function isNothing(v) {
  return v == null || Number.isNaN(v);
};
var isSomething = pipe2(isNothing, not);

var assertSomethingIdentity = function assertSomethingIdentity(x) {
  if (isNothing(x)) {
    throw TypeError('expected a value but got nothing (null, undefined or NaN)');
  }

  return x;
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

var reviverOrAsIs = pipe2(get$$1('reviver'), defaultTo(asIsReviver(assertSomethingIdentity)));

var isPlainObject = function isPlainObject(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x;
};
var isFunction = function isFunction(x) {
  return typeof x === 'function';
};
var emptyObject = Object.freeze({});
var emptyArray = Object.freeze([]);

var haveSameValues = function haveSameValues(a, b) {
  return a === b || Object.is(a, b);
};

var haveSameType = function haveSameType(a, b) {
  return a == null || b == null ? a === b : a.constructor === b.constructor;
};

var haveDifferentTypes = pipe2(haveSameType, not);

var equals = function equals(a, b) {
  return isSomething(a) && a.equals ? a.equals(b) : haveSameValues(a, b);
};

var unsupported = function unsupported(message) {
  throw Error(message);
};

var metaOrTypeMapper = function metaOrTypeMapper(_) {
  return function (x) {
    return isPlainObject(x) ? x : _(x);
  };
};

var formatAjvError = function formatAjvError(ajv, schema, value) {
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  return ['Invalid JSON at "' + path.join(' -> ') + '". According to the schema\n', JSON.stringify(schema, null, 2) + '\n', 'the value (data path "' + ajv.errors.filter(function (e) {
    return e.dataPath !== '';
  }).map(function (error) {
    return error.dataPath;
  }) + '")\n', JSON.stringify(value, null, 2) + ' ' + Object.prototype.toString.call(value) + '\n'].concat(ajv.errors.map(function (error) {
    return error.message;
  })).join('\n');
};

var memCacheRegistry = new WeakMap();
var memDefaultCacheFn = function memDefaultCacheFn() {
  return new WeakMap();
};
var mem = function mem(f) {
  var cacheFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : memDefaultCacheFn;
  return function (a) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    if (args.length > 0) {
      return f.apply(undefined, [a].concat(args));
    }

    if (!memCacheRegistry.has(f)) {
      memCacheRegistry.set(f, cacheFn());
    }

    var cache = memCacheRegistry.get(f) || cacheFn();
    var key = a === undefined ? emptyObject : a;

    if (!cache.has(key)) {
      cache.set(key, f.apply(undefined, [a].concat(args)));
    }

    return cache.get(key);
  };
};

var innerTypesCache = new WeakMap();

var getInnerTypes = function getInnerTypes(path, Type) {
  return Type.innerTypes(path, Type);
};

var getInnerTypes$1 = (function (path, Type) {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type));
  }

  return innerTypesCache.get(Type) || emptyObject;
});

var metadataSchemaCache = new WeakMap();

var state = void 0;
var defaultState = function defaultState() {
  return {
    nextRef: 1,
    definitions: {},
    usedDefinitions: new Set(),
    metadataRefCache: new WeakMap()
  };
};

var enhanceSchemaWithDefault = function enhanceSchemaWithDefault(metadata, schema) {
  if (metadata.default === undefined) {
    return schema;
  }

  var def = { default: metadata.default };

  if (schema === emptyObject) {
    return Object.assign({}, { type: emptyObject }, def);
  }

  return Object.assign({}, {
    anyOf: [{ type: 'null' }, schema]
  }, metadata.type === M.Maybe ? undefined : def);
};

var getSchemaImpl = function getSchemaImpl(metadata) {
  if (metadata.schema) {
    return enhanceSchemaWithDefault(metadata, metadata.schema());
  }

  var hasInnerTypes = metadata.type && metadata.type.innerTypes;

  if (!hasInnerTypes) {
    return enhanceSchemaWithDefault(metadata, emptyObject);
  }

  var innerTypes = getInnerTypes$1([], metadata.type);

  if (Object.keys(innerTypes).length === 0) {
    return emptyObject;
  }

  var baseSchema = { type: 'object' };

  var required = [];
  var properties = Object.keys(innerTypes).reduce(function (acc, fieldName) {
    var fieldMetadata = innerTypes[fieldName];
    var fieldSchema = getSchema(fieldMetadata, false);

    if (fieldMetadata.default === undefined) {
      required.push(fieldName);
    }

    return Object.assign(acc, defineProperty({}, fieldName, fieldSchema));
  }, {});

  var schema = Object.assign({}, baseSchema, { properties: properties });

  if (required.length > 0) {
    schema.required = required;
  }

  return enhanceSchemaWithDefault(metadata, schema);
};

var getUsedDefinitions = function getUsedDefinitions() {
  var _state = state,
      definitions = _state.definitions,
      usedDefinitions = _state.usedDefinitions;


  return Object.keys(definitions).map(Number).reduce(function (acc, ref) {
    if (usedDefinitions.has(ref)) {
      acc[ref] = definitions[ref];
    }

    return acc;
  }, {});
};

var getSchema = function getSchema(metadata) {
  var topLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (metadataSchemaCache.has(metadata)) {
    return metadataSchemaCache.get(metadata) || emptyObject;
  }

  if (topLevel) {
    state = defaultState();
  }

  if (state.metadataRefCache.has(metadata)) {
    var _ref = state.metadataRefCache.get(metadata) || state.nextRef;
    state.usedDefinitions.add(_ref);
    return { $ref: '#/definitions/' + _ref };
  }

  var ref = state.nextRef;

  state.metadataRefCache.set(metadata, ref);
  state.nextRef += 1;

  var schema = getSchemaImpl(metadata);

  Object.assign(state.definitions, defineProperty({}, ref, schema));

  if (!topLevel) {
    var _ref2 = state.metadataRefCache.get(metadata);
    var schemaKeys = Object.keys(schema);

    if (!_ref2 || schemaKeys.length <= 1 && !Array.isArray(schema[schemaKeys[0]])) {
      return schema;
    }

    state.usedDefinitions.add(_ref2);
    return { $ref: '#/definitions/' + _ref2 };
  }

  var definitions = getUsedDefinitions();
  var finalSchema = void 0;

  if (Object.keys(definitions).length === 0) {
    finalSchema = schema;
  } else if (!definitions.hasOwnProperty(ref)) {
    finalSchema = Object.assign({}, schema, { definitions: definitions });
  } else {
    finalSchema = {
      definitions: Object.assign(definitions, defineProperty({}, ref, schema)),
      $ref: '#/definitions/' + ref
    };
  }

  metadataSchemaCache.set(metadata, finalSchema);

  return finalSchema;
};

var validate = (function (instance) {
  var innerMetadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (!(instance instanceof M.Base)) {
    throw TypeError('Modelico.validate only works with instances of Modelico.Base');
  }

  try {
    M.genericsFromJSON(instance[M.symbols.typeSymbol](), innerMetadata, JSON.stringify(instance));
  } catch (e) {
    return [false, e];
  }

  return [true, undefined];
});

var defaultErrorMsgFn = function defaultErrorMsgFn(x, path) {
  return 'Invalid value at "' + path.join(' -> ') + '"';
};

var withValidation = (function (validateFn) {
  var errorMsgFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultErrorMsgFn;
  return function (metadata) {
    var reviver = function reviver(k, v) {
      var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      if (k !== '') {
        return v;
      }

      var revivedValue = metadata.reviver('', v, path);

      if (!validateFn(revivedValue)) {
        throw TypeError(errorMsgFn(revivedValue, path));
      }

      return revivedValue;
    };

    return Object.assign({}, metadata, { reviver: reviver });
  };
});

var cacheRegistry = new WeakMap();

var withCache = function withCache(obj, fn) {
  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : fn;

  if (!cacheRegistry.has(obj)) {
    cacheRegistry.set(obj, new Map());
  }

  var cache = cacheRegistry.get(obj);

  if (!cache.has(key)) {
    cache.set(key, fn.apply(obj, args));
  }

  return cache.get(key);
};

var asIs = mem(function () {
  var transformer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : identity;
  return Object.freeze({
    type: transformer,
    reviver: asIsReviver(pipe(assertSomethingIdentity, transformer)),
    maybeReviver: asIsReviver(transformer)
  });
});

var any = always(asIs(identity));

var anyOf = (function () {
  var conditionedMetas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var enumField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'type';
  return function (v, path) {
    if (conditionedMetas.length === 0) {
      return any;
    }

    var Enum = conditionedMetas[0][1][typeSymbol]();
    var enumeratorToMatch = Enum.metadata().reviver('', v[enumField]);

    for (var i = 0; i < conditionedMetas.length; i += 1) {
      var conditionedMeta = conditionedMetas[i];
      var metadata = conditionedMeta[0];
      var enumerator = conditionedMeta[1];

      if (enumeratorToMatch === enumerator) {
        return metadata;
      }
    }

    var prevPath = path.slice(0, -1);

    throw TypeError('unsupported enumerator "' + enumeratorToMatch.toJSON() + '" at "' + prevPath.join(' -> ') + '"');
  };
});

var plainObjectReviverFactory = function plainObjectReviverFactory(Type, k, v, prevPath) {
  return Object.keys(v).reduce(function (acc, field) {
    var path = prevPath.concat(field);
    var innerTypes = getInnerTypes$1(prevPath, Type);

    var metadataCandidate = innerTypes[field];
    var metadata = isFunction(metadataCandidate) ? metadataCandidate(v, path) : metadataCandidate;

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field], path);
    } else {
      acc[field] = v[field];
    }

    return acc;
  }, {});
};

var reviverFactory = function reviverFactory(Type) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    var fields = isPlainObject(v) ? plainObjectReviverFactory(Type, k, v, path) : v;

    return new Type(fields);
  };
};

var isMatch = function isMatch(obj) {
  return function (meta) {
    var innerTypes = meta.type.innerTypes();
    var innerTypesKeys = Object.keys(innerTypes);
    var objIsPlainObject = isPlainObject(obj);

    if (innerTypesKeys.length === 0 && objIsPlainObject) {
      return false;
    }

    return innerTypesKeys.filter(function (propName) {
      return !innerTypes[propName].hasOwnProperty('default');
    }).every(function (propName) {
      return objIsPlainObject ? obj.hasOwnProperty(propName) : false;
    });
  };
};

var inferClassifier = function inferClassifier(metas) {
  return function (obj) {
    var matches = metas.filter(isMatch(obj), []);

    if (matches.length === 0) {
      throw Error('Unable to infer type');
    }

    if (matches.length > 1) {
      throw Error('Ambiguous object: more than one metadata matches the object. ' + 'A custom classifier can be passed as a second argument.');
    }

    return matches[0];
  };
};

var getPathReducer = function getPathReducer(result, part) {
  return result.get(part);
};

var Base = function () {
  function Base(Type) {
    var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;
    var thisArg = arguments[2];
    classCallCheck(this, Base);

    if (!isPlainObject(fields)) {
      throw TypeError('expected an object with fields for ' + (Type.displayName || Type.name) + ' but got ' + fields);
    }

    // This slows down the benchmarks by a lot, but it isn't clear whether
    // real usage would benefit from removing it.
    // See: https://github.com/javiercejudo/modelico-benchmarks
    Object.freeze(fields);

    var defaults$$1 = {};
    var innerTypes = getInnerTypes$1([], Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);

    Object.keys(innerTypes).forEach(function (key) {
      var valueCandidate = fields[key];
      var defaultCandidate = innerTypes[key].default;
      var value = void 0;

      if (isSomething(valueCandidate)) {
        value = valueCandidate;
      } else if (defaultCandidate !== undefined) {
        value = innerTypes[key].reviver('', defaultCandidate);
        defaults$$1[key] = value;
      } else {
        throw TypeError('no value for key "' + key + '"');
      }

      thisArg[key] = always(value);
    });

    thisArg[fieldsSymbol] = always(Object.freeze(Object.assign(defaults$$1, fields)));
  }

  createClass(Base, [{
    key: 'get',
    value: function get$$1(field) {
      return this[fieldsSymbol]()[field];
    }
  }, {
    key: 'getIn',
    value: function getIn(path) {
      return path.reduce(getPathReducer, this);
    }
  }, {
    key: 'copy',
    value: function copy(fields) {
      var newFields = Object.assign({}, this[fieldsSymbol](), fields);

      return new (this[typeSymbol]())(newFields);
    }
  }, {
    key: 'set',
    value: function set$$1(field, value) {
      return this.copy(defineProperty({}, field, value));
    }
  }, {
    key: 'setIn',
    value: function setIn(path, value) {
      if (path.length === 0) {
        return this.copy(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this[key]();

      if (!item.setIn) {
        return this.set(key, value);
      }

      return this.set(key, item.setIn(restPath, value));
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      var thisFields = this[fieldsSymbol]();
      var otherFields = other[fieldsSymbol]();

      var thisKeys = Object.keys(thisFields);
      var otherKeys = Object.keys(otherFields);

      if (thisKeys.length !== otherKeys.length) {
        return false;
      }

      return thisKeys.every(function (key) {
        return equals(thisFields[key], otherFields[key]);
      });
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
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoModel';
    }
  }], [{
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }, {
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

var set$1 = function set$$1(thisArg, Type, key, value) {
  var immutableMap = thisArg.inner();
  var newImmutableMap = immutableMap.set(key, value);

  if (immutableMap === newImmutableMap) {
    return thisArg;
  }

  return Type.fromArray([].concat(toConsumableArray(newImmutableMap)));
};

var of = function of(Type, args) {
  var len = args.length;

  if (len % 2 === 1) {
    throw TypeError(Type.displayName + '.of requires an even number of arguments');
  }

  var map = new Map();

  for (var i = 0; i < len; i += 2) {
    map.set(args[i], args[i + 1]);
  }

  return Type.fromMap(map);
};

var metadata$2 = mem(function (Type) {
  return mem(function (reviverFactory) {
    return mem(function (keyMetadata) {
      return mem(function (valueMetadata) {
        return Object.freeze({
          type: Type,
          subtypes: Object.freeze([keyMetadata, valueMetadata]),
          reviver: reviverFactory(keyMetadata, valueMetadata)
        });
      });
    });
  });
});

var AbstractMap = function (_Base) {
  inherits(AbstractMap, _Base);

  function AbstractMap(Type) {
    var innerMapOrig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Map();
    var EMPTY = arguments[2];
    classCallCheck(this, AbstractMap);

    var _this = possibleConstructorReturn(this, (AbstractMap.__proto__ || Object.getPrototypeOf(AbstractMap)).call(this, Type));

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map');
    }

    if (EMPTY && innerMapOrig.size === 0) {
      var _ret;

      return _ret = EMPTY, possibleConstructorReturn(_this, _ret);
    }

    var innerMap = immutable.OrderedMap(innerMapOrig);

    _this[innerOrigSymbol] = always(innerMap);
    _this.inner = always(innerMap);
    _this.size = innerMap.size;
    return _this;
  }

  createClass(AbstractMap, [{
    key: Symbol.iterator,
    value: function value() {
      return this[innerOrigSymbol]()[Symbol.iterator]();
    }
  }, {
    key: 'has',
    value: function has(key) {
      return this[innerOrigSymbol]().has(key);
    }
  }, {
    key: 'get',
    value: function get$$1(key) {
      return this[innerOrigSymbol]().get(key);
    }
  }, {
    key: 'setIn',
    value: function setIn(path, value) {
      if (path.length === 0) {
        return new (this[typeSymbol]())(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this[innerOrigSymbol]().get(key);

      if (!item.setIn) {
        return this.set(key, value);
      }

      return this.set(key, item.setIn(restPath, value));
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      var asUnordered = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      var transform = asUnordered ? immutable.Map : identity;

      return transform(this.inner()).equals(transform(other.inner()));
    }
  }]);
  return AbstractMap;
}(Base$1);

var AbstractMap$1 = Object.freeze(AbstractMap);

var parseMapper = function parseMapper(keyReviver, valueReviver, path) {
  return function (pair, i) {
    return [keyReviver('', pair[0], path.concat(i, 0)), valueReviver('', pair[1], path.concat(i, 1))];
  };
};

var reviverFactory$2 = function reviverFactory(keyMetadata, valueMetadata) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    var keyReviver = reviverOrAsIs(isFunction(keyMetadata) ? keyMetadata(v, path) : keyMetadata);
    var valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

    var innerMap = v === null ? null : new Map(v.map(parseMapper(keyReviver, valueReviver, path)));

    return ModelicoMap.fromMap(innerMap);
  };
};

var EMPTY_MAP = void 0;

var ModelicoMap = function (_AbstractMap) {
  inherits(ModelicoMap, _AbstractMap);

  function ModelicoMap(innerMap) {
    classCallCheck(this, ModelicoMap);

    var _this = possibleConstructorReturn(this, (ModelicoMap.__proto__ || Object.getPrototypeOf(ModelicoMap)).call(this, ModelicoMap, innerMap, EMPTY_MAP));

    if (!EMPTY_MAP && _this.size === 0) {
      EMPTY_MAP = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoMap, [{
    key: 'set',
    value: function set$$1(key, value) {
      return set$1(this, ModelicoMap, key, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this));
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoMap';
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
    value: function of$$1() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return of(ModelicoMap, args);
    }
  }, {
    key: 'fromObject',
    value: function fromObject(obj) {
      return ModelicoMap.fromArray(objToArr(obj));
    }
  }, {
    key: 'metadata',
    value: function metadata$$1(keyMetadata, valueMetadata) {
      return metadata$2(ModelicoMap)(reviverFactory$2)(keyMetadata)(valueMetadata);
    }
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_MAP || ModelicoMap.of();
    }
  }]);
  return ModelicoMap;
}(AbstractMap$1);

ModelicoMap.displayName = 'ModelicoMap';

var ModelicoMap$1 = Object.freeze(ModelicoMap);

var stringifyReducer = function stringifyReducer(acc, pair) {
  acc[pair[0]] = pair[1];

  return acc;
};

var parseReducer = function parseReducer(valueReviver, obj, path) {
  return function (acc, key) {
    return [].concat(toConsumableArray(acc), [[key, valueReviver('', obj[key], path.concat(key))]]);
  };
};

var reviverFactory$3 = function reviverFactory(valueMetadata) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    var valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

    var innerMap = v === null ? null : new Map(Object.keys(v).reduce(parseReducer(valueReviver, v, path), []));

    return StringMap.fromMap(innerMap);
  };
};

var EMPTY_STRING_MAP = void 0;

var StringMap = function (_AbstractMap) {
  inherits(StringMap, _AbstractMap);

  function StringMap(innerMap) {
    classCallCheck(this, StringMap);

    var _this = possibleConstructorReturn(this, (StringMap.__proto__ || Object.getPrototypeOf(StringMap)).call(this, StringMap, innerMap, EMPTY_STRING_MAP));

    if (!EMPTY_STRING_MAP && _this.size === 0) {
      EMPTY_STRING_MAP = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(StringMap, [{
    key: 'set',
    value: function set$$1(key, value) {
      return set$1(this, StringMap, key, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this)).reduce(stringifyReducer, {});
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoStringMap';
    }
  }], [{
    key: 'fromMap',
    value: function fromMap(map) {
      return new StringMap(map);
    }
  }, {
    key: 'fromArray',
    value: function fromArray(pairs) {
      return StringMap.fromMap(new Map(pairs));
    }
  }, {
    key: 'of',
    value: function of$$1() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return of(StringMap, args);
    }
  }, {
    key: 'fromObject',
    value: function fromObject(obj) {
      return StringMap.fromArray(objToArr(obj));
    }
  }, {
    key: 'metadata',
    value: function metadata$$1(valueMetadata) {
      return metadata$2(StringMap)(reviverFactory$3)(valueMetadata)();
    }
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_STRING_MAP || StringMap.of();
    }
  }]);
  return StringMap;
}(AbstractMap$1);

StringMap.displayName = 'StringMap';

var StringMap$1 = Object.freeze(StringMap);

var stringifyReducer$1 = function stringifyReducer(acc, pair) {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

var parseMapper$1 = function parseMapper(keyReviver, valueReviver, obj, path) {
  return function (enumerator) {
    var key = keyReviver('', enumerator, path);
    var val = valueReviver('', obj[enumerator], path.concat(enumerator));

    return [key, val];
  };
};

var reviverFactory$4 = function reviverFactory(keyMetadata, valueMetadata) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    var keyReviver = reviverOrAsIs(isFunction(keyMetadata) ? keyMetadata(v, path) : keyMetadata);
    var valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

    var innerMap = v === null ? null : new Map(Object.keys(v).map(parseMapper$1(keyReviver, valueReviver, v, path)));

    return new EnumMap(innerMap);
  };
};

var EMPTY_ENUM_MAP = void 0;

var EnumMap = function (_AbstractMap) {
  inherits(EnumMap, _AbstractMap);

  function EnumMap(innerMap) {
    classCallCheck(this, EnumMap);

    var _this = possibleConstructorReturn(this, (EnumMap.__proto__ || Object.getPrototypeOf(EnumMap)).call(this, EnumMap, innerMap, EMPTY_ENUM_MAP));

    if (!EMPTY_ENUM_MAP && _this.size === 0) {
      EMPTY_ENUM_MAP = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(EnumMap, [{
    key: 'set',
    value: function set$$1(enumerator, value) {
      return set$1(this, EnumMap, enumerator, value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this)).reduce(stringifyReducer$1, {});
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoEnumMap';
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
    value: function of$$1() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return of(EnumMap, args);
    }
  }, {
    key: 'metadata',
    value: function metadata$$1(keyMetadata, valueMetadata) {
      return metadata$2(EnumMap)(reviverFactory$4)(keyMetadata)(valueMetadata);
    }
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_ENUM_MAP || EnumMap.of();
    }
  }]);
  return EnumMap;
}(AbstractMap$1);

EnumMap.displayName = 'EnumMap';

var EnumMap$1 = Object.freeze(EnumMap);

var reviver = function reviver(k, v) {
  return ModelicoNumber.of(v);
};

var _metadata$1 = mem(function () {
  return Object.freeze({
    type: ModelicoNumber,
    reviver: reviver
  });
});

var ModelicoNumber = function (_Base) {
  inherits(ModelicoNumber, _Base);

  function ModelicoNumber() {
    var number = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
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
    value: function set$$1() {
      unsupported('Number.set is not supported');
    }
  }, {
    key: 'setIn',
    value: function setIn(path, number) {
      if (path.length === 0) {
        return ModelicoNumber.of(number);
      }

      unsupported('ModelicoNumber.setIn is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var v = this.inner();

      return Object.is(v, -0) ? '-0' : v === Infinity ? 'Infinity' : v === -Infinity ? '-Infinity' : Number.isNaN(v) ? 'NaN' : v;
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return haveSameValues(this.inner(), other.inner());
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoNumber';
    }
  }], [{
    key: 'of',
    value: function of(number) {
      return new ModelicoNumber(number);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return _metadata$1();
    }
  }]);
  return ModelicoNumber;
}(Base$1);

ModelicoNumber.displayName = 'ModelicoNumber';

var ModelicoNumber$1 = Object.freeze(ModelicoNumber);

var reviver$1 = function reviver(k, v) {
  var date = v === null ? null : new Date(v);

  return new ModelicoDate(date);
};

var _metadata$2 = mem(function () {
  return Object.freeze({
    type: ModelicoDate,
    reviver: reviver$1
  });
});

var ModelicoDate = function (_Base) {
  inherits(ModelicoDate, _Base);

  function ModelicoDate() {
    var dateOrig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
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
    value: function set$$1() {
      unsupported('Date.set is not supported');
    }
  }, {
    key: 'setIn',
    value: function setIn(path, date) {
      if (path.length === 0) {
        return ModelicoDate.of(date);
      }

      unsupported('Date.setIn is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner().toISOString();
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return this.toJSON() === other.toJSON();
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoDate';
    }
  }], [{
    key: 'of',
    value: function of(date) {
      return new ModelicoDate(date);
    }
  }, {
    key: 'metadata',
    value: function metadata() {
      return _metadata$2();
    }
  }]);
  return ModelicoDate;
}(Base$1);

ModelicoDate.displayName = 'ModelicoDate';

var ModelicoDate$1 = Object.freeze(ModelicoDate);

//

var iterableReviverFactory = function iterableReviverFactory(IterableType, itemMetadata) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    var isTuple = Array.isArray(itemMetadata);

    if (isTuple && v.length !== itemMetadata.length) {
      throw TypeError('tuple has missing or extra items');
    }

    var itemMetadataGetter = isTuple ? function (i) {
      return isFunction(itemMetadata[i]) ? itemMetadata[i](v, path) : itemMetadata[i];
    } : isFunction(itemMetadata) ? always(itemMetadata(v, path)) : always(itemMetadata);

    var revive = function revive(x, i) {
      return reviverOrAsIs(itemMetadataGetter(i))('', x, path.concat(i));
    };

    var iterable = v === null ? null : v.map(revive);

    return new IterableType(iterable);
  };
};

var iterableMetadata = mem(function (IterableType) {
  return mem(function (itemMetadata) {
    return Object.freeze({
      type: IterableType,
      subtypes: Object.freeze([itemMetadata]),
      reviver: iterableReviverFactory(IterableType, itemMetadata)
    });
  });
});

var iterableEquals = function iterableEquals(thisArg, other) {
  var asUnordered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (thisArg === other) {
    return true;
  }

  if (haveDifferentTypes(thisArg, other)) {
    return false;
  }

  var transform = asUnordered ? immutable.Set : identity;

  return transform(thisArg.inner()).equals(transform(other.inner()));
};

var EMPTY_LIST = void 0;

var List$1 = function (_Base) {
  inherits(List$$1, _Base);

  function List$$1() {
    var innerListOrig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    classCallCheck(this, List$$1);

    var _this = possibleConstructorReturn(this, (List$$1.__proto__ || Object.getPrototypeOf(List$$1)).call(this, List$$1));

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list');
    }

    if (EMPTY_LIST && innerListOrig.length === 0) {
      var _ret;

      return _ret = EMPTY_LIST, possibleConstructorReturn(_this, _ret);
    }

    Object.freeze(innerListOrig);
    var innerList = immutable.List(innerListOrig);

    _this.inner = always(innerList);
    _this[innerOrigSymbol] = _this.inner;
    _this.size = innerList.size;

    if (!EMPTY_LIST && _this.size === 0) {
      EMPTY_LIST = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(List$$1, [{
    key: Symbol.iterator,
    value: function value() {
      return this.inner()[Symbol.iterator]();
    }
  }, {
    key: 'includes',
    value: function includes() {
      var _inner;

      return (_inner = this.inner()).includes.apply(_inner, arguments);
    }
  }, {
    key: 'get',
    value: function get$$1(index) {
      return this.inner().get(index);
    }
  }, {
    key: 'set',
    value: function set$$1(index, value) {
      var newList = [].concat(toConsumableArray(this.inner().set(index, value)));

      return List$$1.fromArray(newList);
    }
  }, {
    key: 'setIn',
    value: function setIn(path, value) {
      if (path.length === 0) {
        return List$$1.fromArray(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this.inner().get(key);

      if (!item.setIn) {
        return this.set(key, value);
      }

      return this.set(key, item.setIn(restPath, value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this.inner()));
    }
  }, {
    key: 'toArray',
    value: function toArray$$1() {
      return this.toJSON();
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      return iterableEquals(this, other);
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoList';
    }
  }], [{
    key: 'fromArray',
    value: function fromArray(arr) {
      return new List$$1(arr);
    }
  }, {
    key: 'of',
    value: function of() {
      for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
        arr[_key] = arguments[_key];
      }

      return List$$1.fromArray(arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return iterableMetadata(List$$1)(itemMetadata);
    }
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_LIST || List$$1.of();
    }
  }]);
  return List$$1;
}(Base$1);

List$1.displayName = 'List';

var List$2 = Object.freeze(List$1);

var EMPTY_SET = void 0;

var ModelicoSet = function (_Base) {
  inherits(ModelicoSet, _Base);

  function ModelicoSet() {
    var innerSetOrig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Set();
    classCallCheck(this, ModelicoSet);

    var _this = possibleConstructorReturn(this, (ModelicoSet.__proto__ || Object.getPrototypeOf(ModelicoSet)).call(this, ModelicoSet));

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set');
    }

    if (EMPTY_SET && innerSetOrig.size === 0) {
      var _ret;

      return _ret = EMPTY_SET, possibleConstructorReturn(_this, _ret);
    }

    var innerSet = immutable.OrderedSet(innerSetOrig);

    _this[innerOrigSymbol] = always(innerSet);
    _this.inner = always(innerSet);
    _this.size = innerSet.size;

    if (!EMPTY_SET && _this.size === 0) {
      EMPTY_SET = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(ModelicoSet, [{
    key: Symbol.iterator,
    value: function value() {
      return this.inner()[Symbol.iterator]();
    }
  }, {
    key: 'has',
    value: function has(key) {
      return this[innerOrigSymbol]().has(key);
    }
  }, {
    key: 'set',
    value: function set$$1() {
      unsupported('Set.set is not supported');
    }
  }, {
    key: 'setIn',
    value: function setIn(path, set$$1) {
      if (path.length === 0) {
        return new ModelicoSet(set$$1);
      }

      unsupported('Set.setIn is not supported for non-empty paths');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return [].concat(toConsumableArray(this));
    }
  }, {
    key: 'equals',
    value: function equals$$1() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return iterableEquals.apply(undefined, [this].concat(args));
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoSet';
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
      for (var _len2 = arguments.length, arr = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        arr[_key2] = arguments[_key2];
      }

      return ModelicoSet.fromArray(arr);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return iterableMetadata(ModelicoSet)(itemMetadata);
    }
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_SET || ModelicoSet.of();
    }
  }]);
  return ModelicoSet;
}(Base$1);

ModelicoSet.displayName = 'ModelicoSet';

var ModelicoSet$1 = Object.freeze(ModelicoSet);

var reviverFactory$5 = function reviverFactory(itemMetadata) {
  return function (k, v, path) {
    if (k !== '') {
      return v;
    }

    if (v === null) {
      return new Nothing();
    }

    var metadata = isFunction(itemMetadata) ? itemMetadata(v, path) : itemMetadata;

    var revive = defaultTo(metadata.reviver)(metadata.maybeReviver);
    var revivedValue = revive(k, v, path);

    return Maybe.of(revivedValue);
  };
};

var _metadata$3 = mem(function (itemMetadata) {
  return Object.freeze({
    type: Maybe,
    subtypes: [itemMetadata],
    reviver: reviverFactory$5(itemMetadata),
    default: null
  });
});

var Maybe = function (_Base) {
  inherits(Maybe, _Base);

  function Maybe() {
    classCallCheck(this, Maybe);
    return possibleConstructorReturn(this, (Maybe.__proto__ || Object.getPrototypeOf(Maybe)).apply(this, arguments));
  }

  createClass(Maybe, [{
    key: 'get',
    value: function get$$1(fallbackFieldPair) {
      var fallback = fallbackFieldPair[0];
      var field = fallbackFieldPair[1];
      var item = this.getOrElse(fallback);

      return item.get ? item.get(field) : item;
    }
  }, {
    key: 'set',
    value: function set$$1(field, v) {
      if (this.isEmpty()) {
        return this;
      }

      var item = this.inner();

      if (isNothing(item)) {
        return this;
      }

      var newItem = item.set ? item.set(field, v) : null;

      return Maybe.of(newItem);
    }
  }, {
    key: 'setIn',
    value: function setIn(path, v) {
      if (path.length === 0) {
        return Maybe.of(v);
      }

      var _path = toArray(path),
          fallbackOrFieldPair = _path[0],
          restPath = _path.slice(1);

      var fallback = fallbackOrFieldPair[0];
      var field = fallbackOrFieldPair[1];

      var item = this.isEmpty() ? fallback : this.inner();

      var inner = item.setIn ? item.setIn([field].concat(toConsumableArray(restPath)), v) : null;

      return Maybe.of(inner);
    }
  }], [{
    key: 'of',
    value: function of(v) {
      return isNothing(v) || v instanceof Nothing ? new Nothing() : new Just(v);
    }
  }, {
    key: 'metadata',
    value: function metadata(itemMetadata) {
      return _metadata$3(itemMetadata);
    }
  }]);
  return Maybe;
}(Base$1);

Maybe.displayName = 'Maybe';

var nothing = void 0;

var Nothing = function (_Maybe) {
  inherits(Nothing, _Maybe);

  function Nothing() {
    var _ret;

    classCallCheck(this, Nothing);

    var _this2 = possibleConstructorReturn(this, (Nothing.__proto__ || Object.getPrototypeOf(Nothing)).call(this, Nothing));

    if (!nothing) {
      _this2.inner = function () {
        throw TypeError('nothing holds no value');
      };

      nothing = _this2;
    }

    return _ret = nothing, possibleConstructorReturn(_this2, _ret);
  }

  createClass(Nothing, [{
    key: 'toJSON',
    value: function toJSON() {
      return null;
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return true;
    }
  }, {
    key: 'getOrElse',
    value: function getOrElse(v) {
      return v;
    }
  }, {
    key: 'map',
    value: function map(f) {
      return this;
    }
  }, {
    key: 'flatMap',
    value: function flatMap(f) {
      return this;
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      return this === other;
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoNothing';
    }
  }]);
  return Nothing;
}(Maybe);

Nothing.displayName = 'Nothing';

var Just = function (_Maybe2) {
  inherits(Just, _Maybe2);

  function Just(v) {
    classCallCheck(this, Just);

    var _this3 = possibleConstructorReturn(this, (Just.__proto__ || Object.getPrototypeOf(Just)).call(this, Just));

    _this3.inner = always(v);

    Object.freeze(_this3);
    return _this3;
  }

  createClass(Just, [{
    key: 'toJSON',
    value: function toJSON() {
      var v = this.inner();

      if (isNothing(v)) {
        return null;
      }

      return v.toJSON ? v.toJSON() : v;
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return false;
    }
  }, {
    key: 'getOrElse',
    value: function getOrElse() {
      return this.inner();
    }
  }, {
    key: 'map',
    value: function map(f) {
      return Just.of(f(this.inner()));
    }
  }, {
    key: 'flatMap',
    value: function flatMap(f) {
      var res = f(this.inner());

      if (!(res instanceof Maybe)) {
        throw TypeError('Maybe.flatMap expects a Maybe-returning function');
      }

      return res;
    }
  }, {
    key: 'equals',
    value: function equals$$1(other) {
      if (this === other) {
        return true;
      }

      if (haveDifferentTypes(this, other)) {
        return false;
      }

      return equals(this.inner(), other.inner());
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoJust';
    }
  }], [{
    key: 'of',
    value: function of(v) {
      return new Just(v);
    }
  }]);
  return Just;
}(Maybe);

Just.displayName = 'Just';

Maybe.Nothing = new Nothing();
Maybe.Just = Just;

var Maybe$1 = Object.freeze(Maybe);

var base = mem(function (Type) {
  return Object.freeze({ type: Type, reviver: reviverFactory(Type) });
});

var _impl = function _impl(Type, innerMetadata) {
  return Type.metadata ? Type.metadata.apply(Type, toConsumableArray(innerMetadata)) : base(Type);
};

var _implMem = mem(function (Type) {
  return mem(function (innerMetadata) {
    return _impl(Type, innerMetadata);
  });
});
var _$1 = function _(Type) {
  var innerMetadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyArray;
  return _implMem(Type)(innerMetadata);
};

var withDefaultImpl = function withDefaultImpl(metadata, def) {
  var reviver = function reviver(k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return v;
    }

    if (isNothing(v)) {
      var defMetadata = defaultTo(metadata)(metadata.baseMetadata);

      return defMetadata.reviver(k, def, path);
    }

    return metadata.reviver(k, v, path);
  };

  return Object.freeze(Object.assign({}, metadata, {
    default: JSON.parse(JSON.stringify(def)),
    reviver: reviver
  }));
};

var withDefaultMem = mem(function (metadata) {
  return mem(function (def) {
    return withDefaultImpl(metadata, def);
  }, function () {
    return new Map();
  });
});

var withDefault = function withDefault(metadata, def) {
  return withDefaultMem(metadata)(def);
};

var union = function union(Type, metasOrTypes, classifier) {
  var metas = metasOrTypes.map(metaOrTypeMapper(_$1));

  classifier = classifier === undefined ? inferClassifier(metas) : classifier;

  var reviver = function reviver(k, obj) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (k !== '') {
      return obj;
    }

    return classifier(obj, metas).reviver(k, obj, path);
  };

  return Object.assign({}, base(Type), { reviver: reviver, subtypes: metas });
};

var metadata$1 = always(Object.freeze({
  _: _$1,
  base: base,
  asIs: asIs,
  any: any,
  anyOf: anyOf,
  union: union,

  number: always(asIs(Number)),
  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),

  wrappedNumber: ModelicoNumber$1.metadata,
  date: ModelicoDate$1.metadata,
  enumMap: EnumMap$1.metadata,
  list: List$2.metadata,
  map: ModelicoMap$1.metadata,
  stringMap: StringMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata,

  withDefault: withDefault
}));

var getInnerSchema = function getInnerSchema(metadata) {
  return M.getSchema(metadata, false);
};

var ajvMetadata = mem(function () {
  var ajv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { validate: T };

  var getSchema = M.getSchema;
  var metadata = M.metadata();
  var ajvMetadata = {};

  var _ = metadata._,
      base = metadata.base,
      asIs = metadata.asIs,
      any = metadata.any,
      anyOf = metadata.anyOf,
      union = metadata.union,
      string = metadata.string,
      number = metadata.number,
      wrappedNumber = metadata.wrappedNumber,
      boolean = metadata.boolean,
      date = metadata.date,
      enumMap = metadata.enumMap,
      list = metadata.list,
      map = metadata.map,
      stringMap = metadata.stringMap,
      set$$1 = metadata.set,
      maybe = metadata.maybe,
      withDefault = metadata.withDefault;


  var ensure = function ensure(metadata, schema) {
    var valueTransformer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity;
    var reviverName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'reviver';
    return function (k, value) {
      var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      if (k !== '') {
        return value;
      }

      var valid = schema === emptyObject ? true : ajv.validate(schema, valueTransformer(value));

      if (!valid) {
        throw TypeError(formatAjvError(ajv, schema, value, path));
      }

      var resolvedMetadata = isFunction(metadata) ? metadata(value, path) : metadata;

      return resolvedMetadata[reviverName]('', value, path);
    };
  };

  var ensureWrapped = function ensureWrapped(metadata, schema1, schema2, reviverName) {
    return function (k, value) {
      var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      if (k !== '') {
        return value;
      }

      var unwrappedValue = ensure(metadata, schema1, identity, reviverName)(k, value);

      return ensure(any(), schema2, function (x) {
        return x.inner();
      }, reviverName)(k, unwrappedValue, path);
    };
  };

  var ajvMeta = function ajvMeta(metadata, baseSchema) {
    var mainSchema = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emptyObject;
    var innerSchemaGetter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : always(emptyObject);

    var schemaToCheck = baseSchema === emptyObject && mainSchema === emptyObject ? emptyObject : Object.assign({}, baseSchema, mainSchema);

    var reviver = ensure(metadata, schemaToCheck);

    var schemaGetter = function schemaGetter() {
      return Object.assign({}, schemaToCheck, innerSchemaGetter());
    };

    var baseMetadata = isFunction(metadata) ? { type: metadata } : metadata;

    var enhancedMeta = Object.assign({}, baseMetadata, {
      baseMetadata: baseMetadata,
      reviver: reviver,
      ownSchema: always(schemaToCheck),
      schema: schemaGetter
    });

    if (metadata.maybeReviver) {
      enhancedMeta.maybeReviver = ensure(metadata, schemaToCheck, identity, 'maybeReviver');
    }

    return enhancedMeta;
  };

  ajvMetadata.ajvMeta = ajvMeta;

  var _ajvImpl = function _ajvImpl(Type, innerMetadata, schema, topLevel) {
    var metadata = _(Type, innerMetadata);

    return schema === emptyObject ? metadata : ajvMeta(metadata, emptyObject, schema, function () {
      return getSchema(metadata, topLevel);
    });
  };

  var _ajv = mem(function (Type) {
    return mem(function (innerMetadata) {
      return mem(function (schema) {
        return mem(function (topLevel) {
          return _ajvImpl(Type, innerMetadata, schema, topLevel);
        }, function () {
          return new Map();
        });
      });
    });
  });

  ajvMetadata._ = function (Type, innerMetadata) {
    var schema = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emptyObject;
    var topLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return _ajv(Type)(innerMetadata)(schema)(topLevel);
  };

  var ajvBaseImpl = function ajvBaseImpl(Type, schema, topLevel) {
    var metadata = base(Type);

    return schema === emptyObject ? metadata : ajvMeta(metadata, { type: 'object' }, schema, function () {
      return getSchema(metadata, topLevel);
    });
  };

  var ajvBase = mem(function (Type) {
    return mem(function (schema) {
      return mem(function (topLevel) {
        return ajvBaseImpl(Type, schema, topLevel);
      }, function () {
        return new Map();
      });
    });
  });

  ajvMetadata.base = function (Type) {
    var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;
    var topLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return ajvBase(Type)(schema)(topLevel);
  };

  var ajvAsIsImpl = function ajvAsIsImpl(transformer, schema) {
    return ajvMeta(asIs(transformer), schema);
  };

  var ajvAsIs = mem(function (transformer) {
    return mem(function (schema) {
      return ajvAsIsImpl(transformer, schema);
    });
  });

  ajvMetadata.asIs = function (transformer, schema) {
    return ajvAsIs(transformer)(schema);
  };
  ajvMetadata.any = function (schema) {
    return ajvMetadata.asIs(identity, schema);
  };

  ajvMetadata.wrappedNumber = mem(function (schema) {
    var metadata = wrappedNumber();
    var numberMeta = Object.assign({ type: 'number' }, schema);

    var baseSchema = {
      anyOf: [{ type: 'number' }, { enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }]
    };

    var reviver = ensureWrapped(metadata, baseSchema, numberMeta);

    return Object.assign({}, metadata, {
      reviver: reviver,
      ownSchema: always(numberMeta),
      schema: always(numberMeta)
    });
  });

  ajvMetadata.number = mem(function (schema) {
    return ajvMeta(number(), { type: 'number' }, schema);
  });

  ajvMetadata.string = mem(function (schema) {
    return ajvMeta(string(), { type: 'string' }, schema);
  });

  ajvMetadata.boolean = mem(function (schema) {
    return ajvMeta(boolean(), { type: 'boolean' }, schema);
  });

  ajvMetadata.date = mem(function (schema) {
    return ajvMeta(date(), { type: 'string', format: 'date-time' }, schema);
  });

  ajvMetadata._enum = mem(function (Type) {
    var metadata = _(Type);

    return ajvMeta(metadata, {
      enum: Object.keys(metadata.enumerators)
    });
  });

  var ajvEnumMapImpl = function ajvEnumMapImpl(keyMetadata, valueMetadata, schema) {
    var enumeratorsKeys = Object.keys(keyMetadata.enumerators);
    var keysRegex = '^(' + enumeratorsKeys.join('|') + ')$';

    return ajvMeta(enumMap(keyMetadata, valueMetadata), {
      type: 'object',
      maxProperties: enumeratorsKeys.length,
      additionalProperties: false,
      patternProperties: defineProperty({}, keysRegex, {})
    }, schema, function () {
      return {
        patternProperties: defineProperty({}, keysRegex, getInnerSchema(valueMetadata, false))
      };
    });
  };

  var ajvEnumMap = mem(function (keyMetadata) {
    return mem(function (valueMetadata) {
      return mem(function (schema) {
        return ajvEnumMapImpl(keyMetadata, valueMetadata, schema);
      });
    });
  });

  ajvMetadata.enumMap = function (keyMetadata, valueMetadata, schema) {
    return ajvEnumMap(keyMetadata)(valueMetadata)(schema);
  };

  var ajvListImpl = function ajvListImpl(itemMetadata, schema) {
    return ajvMeta(list(itemMetadata), { type: 'array' }, schema, function () {
      return {
        items: getInnerSchema(itemMetadata)
      };
    });
  };

  var ajvList = mem(function (itemMetadata) {
    return mem(function (schema) {
      return ajvListImpl(itemMetadata, schema);
    });
  });

  var ajvTupleImpl = function ajvTupleImpl(itemsMetadata, schema) {
    var length = itemsMetadata.length;

    return ajvMeta(list(itemsMetadata), {
      type: 'array',
      minItems: length,
      maxItems: length
    }, schema, function () {
      return {
        items: itemsMetadata.map(function (itemMetadata) {
          return getInnerSchema(itemMetadata);
        })
      };
    });
  };

  var ajvTuple = mem(function (itemsMetadata) {
    return mem(function (schema) {
      return ajvTupleImpl(itemsMetadata, schema);
    });
  });

  ajvMetadata.list = function (itemMetadata, schema) {
    return Array.isArray(itemMetadata) ? ajvTuple(itemMetadata)(schema) : ajvList(itemMetadata)(schema);
  };

  var ajvMapImpl = function ajvMapImpl(keyMetadata, valueMetadata, schema) {
    var baseSchema = {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    };

    var keyValueSchemaGetter = function keyValueSchemaGetter() {
      return {
        items: Object.assign({
          items: [getInnerSchema(keyMetadata), getInnerSchema(valueMetadata)]
        }, baseSchema.items)
      };
    };

    return ajvMeta(map(keyMetadata, valueMetadata), baseSchema, schema, keyValueSchemaGetter);
  };

  var ajvMap = mem(function (keyMetadata) {
    return mem(function (valueMetadata) {
      return mem(function (schema) {
        return ajvMapImpl(keyMetadata, valueMetadata, schema);
      });
    });
  });

  ajvMetadata.map = function (keyMetadata, valueMetadata, schema) {
    return ajvMap(keyMetadata)(valueMetadata)(schema);
  };

  var ajvStringMapImpl = function ajvStringMapImpl(valueMetadata, schema) {
    return ajvMeta(stringMap(valueMetadata), { type: 'object' }, schema, function () {
      return {
        additionalProperties: false,
        patternProperties: {
          '.*': getInnerSchema(valueMetadata)
        }
      };
    });
  };

  var ajvStringMap = mem(function (valueMetadata) {
    return mem(function (schema) {
      return ajvStringMapImpl(valueMetadata, schema);
    });
  });

  ajvMetadata.stringMap = function (valueMetadata, schema) {
    return ajvStringMap(valueMetadata)(schema);
  };

  var ajvSetImpl = function ajvSetImpl(itemMetadata, schema) {
    return ajvMeta(set$$1(itemMetadata), {
      type: 'array',
      uniqueItems: true
    }, schema, function () {
      return { items: getInnerSchema(itemMetadata) };
    });
  };

  var ajvSet = mem(function (itemMetadata) {
    return mem(function (schema) {
      return ajvSetImpl(itemMetadata, schema);
    });
  });

  ajvMetadata.set = function (itemMetadata, schema) {
    return ajvSet(itemMetadata)(schema);
  };

  var ajvMaybeImpl = function ajvMaybeImpl(itemMetadata, schema) {
    return ajvMeta(maybe(itemMetadata), emptyObject, schema, function () {
      return getInnerSchema(itemMetadata);
    });
  };

  var ajvMaybe = mem(function (itemMetadata) {
    return mem(function (schema) {
      return ajvMaybeImpl(itemMetadata, schema);
    });
  });

  ajvMetadata.maybe = function (itemMetadata, schema) {
    return ajvMaybe(itemMetadata)(schema);
  };

  var ajvWithDefaultImpl = function ajvWithDefaultImpl(itemMetadata, def, schema) {
    return ajvMeta(withDefault(itemMetadata, def), emptyObject, schema, function () {
      return getInnerSchema(itemMetadata);
    });
  };

  var ajvWithDefault = mem(function (itemMetadata) {
    return mem(function (def) {
      return mem(function (schema) {
        return ajvWithDefaultImpl(itemMetadata, def, schema);
      });
    }, function () {
      return new Map();
    });
  });

  ajvMetadata.withDefault = function (itemMetadata, def, schema) {
    return ajvWithDefault(itemMetadata)(def)(schema);
  };

  ajvMetadata.anyOf = function (conditionedMetas, enumField) {
    return ajvMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(function (conditionMeta) {
        return getInnerSchema(conditionMeta[0]);
      })
    });
  };

  ajvMetadata.union = function (Type, metasOrTypes, classifier) {
    var metas = metasOrTypes.map(metaOrTypeMapper(_));
    var baseMetadata = union(Type, metas, classifier);

    return ajvMeta(baseMetadata, emptyObject, emptyObject, function () {
      return {
        // The classifier might determine how multiple matches resolve, hence the
        // use of anyOf instead of oneOf. Ambiguities will still be caught.
        anyOf: metas.map(getInnerSchema)
      };
    });
  };

  return Object.freeze(Object.assign({}, metadata, ajvMetadata));
});

var enumeratorsReducer = function enumeratorsReducer(acc, code) {
  return Object.assign(acc, defineProperty({}, code, { code: code }));
};

var reviverFactory$6 = function reviverFactory(enumerators) {
  return function (k, v) {
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var enumerator = enumerators[v];

    if (isNothing(enumerator)) {
      throw TypeError('missing enumerator "' + v + '" at "' + path.join(' -> ') + '"');
    }

    return enumerator;
  };
};

var Enum = function (_Base) {
  inherits(Enum, _Base);

  function Enum(input) {
    var Ctor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Enum;
    var displayName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Ctor.displayName;
    classCallCheck(this, Enum);

    var enumerators = Array.isArray(input) ? input.reduce(enumeratorsReducer, {}) : input;

    if (Ctor !== Enum) {
      Ctor.displayName = displayName;
      Object.freeze(Ctor);
    }

    var _this = possibleConstructorReturn(this, (Enum.__proto__ || Object.getPrototypeOf(Enum)).call(this, Ctor));

    Object.getOwnPropertyNames(enumerators).forEach(function (enumerator) {
      _this[enumerator] = always(enumerators[enumerator]);
      enumerators[enumerator][typeSymbol] = always(_this);
      enumerators[enumerator].toJSON = always(enumerator);
      enumerators[enumerator].equals = function (other) {
        return enumerators[enumerator] === other;
      };
    });

    Object.defineProperty(_this, 'metadata', {
      value: always(Object.freeze({
        type: _this,
        enumerators: enumerators,
        reviver: reviverFactory$6(enumerators)
      }))
    });
    return _this;
  }

  createClass(Enum, null, [{
    key: 'fromObject',
    value: function fromObject() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new (Function.prototype.bind.apply(Enum, [null].concat(args)))();
    }
  }, {
    key: 'fromArray',
    value: function fromArray() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new (Function.prototype.bind.apply(Enum, [null].concat(args)))();
    }
  }]);
  return Enum;
}(Base$1);

Object.defineProperty(Enum, 'displayName', {
  value: 'Enum',
  writable: true
});

var proxyToSelf = function proxyToSelf(nonMutators, mutators, innerCloner, target, prop) {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return function () {
    var newObj = target[prop].apply(target, arguments);

    return proxyFactory(nonMutators, mutators, innerCloner, newObj);
  };
};

var proxyToInner = function proxyToInner(inner, candidate, nonMutators, mutators, innerCloner, target, prop) {
  if (nonMutators.includes(prop)) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var newObj = target.setIn([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, innerCloner, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      candidate.apply(inner, args);
      var newObj = target.setIn([], inner);

      return proxyFactory(nonMutators, mutators, innerCloner, newObj);
    };
  }

  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return candidate.apply(inner, args);
  };
};

var proxyFactory = function proxyFactory(nonMutators, mutators, innerCloner, obj) {
  var get = function get(target, prop) {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, innerCloner, target, prop);
    }

    var inner = innerCloner(target.inner());
    var candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, innerCloner, target, prop);
    }

    return candidate;
  };

  return new Proxy(obj, { get: get });
};

var metadata$3 = metadata$1();

var createModel = function createModel() {
  var _innerTypes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : emptyObject;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$base = _ref.base,
      base = _ref$base === undefined ? Base$1 : _ref$base,
      _ref$stringTag = _ref.stringTag,
      stringTag = _ref$stringTag === undefined ? 'ModelicoModel' : _ref$stringTag,
      _ref$metadata = _ref.metadata,
      m = _ref$metadata === undefined ? metadata$3 : _ref$metadata;

  var Model = function (_base) {
    inherits(Model, _base);

    function Model() {
      classCallCheck(this, Model);

      var args = arguments;

      if (args.length === 2) {
        var _this = possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this, args[0], args[1]));
      } else {
        var propsCandidate = args[0];
        var props = propsCandidate === undefined ? {} : propsCandidate;

        var _this = possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this, Model, props));
      }
      return possibleConstructorReturn(_this);
    }

    createClass(Model, [{
      key: Symbol.toStringTag,
      get: function get$$1() {
        return stringTag;
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes(path, Type) {
        return isFunction(_innerTypes) ? _innerTypes(m, { path: path, Type: Type }) : Object.freeze(_innerTypes);
      }
    }]);
    return Model;
  }(base);

  Model.displayName = stringTag;

  return Model;
};

var _metadataFactory = metadata$1();
var defaultUnion = _metadataFactory.union;

var createUnionType = function createUnionType(metasOrTypes, classifier) {
  var union = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultUnion;

  var metas = metasOrTypes.map(function (x) {
    return isPlainObject(x) && !(x instanceof M.Enum) ? x : M.metadata()._(x);
  });

  classifier = classifier === undefined ? inferClassifier(metas) : classifier;

  var metasCount = metas.length;

  var UnionType = function (_M$Base) {
    inherits(UnionType, _M$Base);

    function UnionType() {
      classCallCheck(this, UnionType);
      return possibleConstructorReturn(this, (UnionType.__proto__ || Object.getPrototypeOf(UnionType)).apply(this, arguments));
    }

    createClass(UnionType, null, [{
      key: 'caseOf',
      value: function caseOf() {
        for (var _len = arguments.length, cases = Array(_len), _key = 0; _key < _len; _key++) {
          cases[_key] = arguments[_key];
        }

        var casesMap = new Map(cases);
        var casesCount = casesMap.size;

        if (metasCount !== casesCount) {
          throw Error('caseOf expected ' + metasCount + ' but contains ' + casesCount);
        }

        if (!metas.every(function (meta) {
          return casesMap.has(meta.type);
        })) {
          throw Error('caseOf does not cover all cases');
        }

        return function (instance, def) {
          var typeGetter = instance[typeSymbol];
          var Type = typeGetter ? typeGetter() : instance.constructor;
          var typeCaseCandidate = casesMap.get(Type);

          var typeCase = typeCaseCandidate !== undefined ? typeCaseCandidate : def;

          return isFunction(typeCase) ? typeCase(instance) : typeCase;
        };
      }
    }, {
      key: 'metadata',
      value: function metadata() {
        return union(UnionType, metas, classifier);
      }
    }]);
    return UnionType;
  }(M.Base);

  return UnionType;
};

var _metadata = metadata$1();
var _ = _metadata._;

var internalNonMutators = ['set', 'setIn'];

var mapNonMutators = internalNonMutators.concat(['delete', 'clear', 'update', 'merge', 'mergeWith', 'mergeDeep', 'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'sortBy', 'slice', 'rest', 'butLast', 'skip', 'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile', 'takeUntil', 'concat', 'withMutations']);

var mapMutators = [];

var setNonMutators = internalNonMutators.concat(['add', 'delete', 'clear', 'union', 'merge', 'intersect', 'subtract', 'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'concat', 'withMutations']);

var setMutators = [];

var listNonMutators = internalNonMutators.concat(['delete', 'insert', 'clear', 'push', 'pop', 'unshift', 'shift', 'update', 'merge', 'mergeWith', 'mergeDeep', 'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'sortBy', 'slice', 'rest', 'butLast', 'skip', 'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile', 'takeUntil', 'concat', 'withMutations']);

var listMutators = [];

var dateNonMutators = internalNonMutators;

var dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

var proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity);

var genericsFromJS = function genericsFromJS(Type, innerMetadata, js) {
  return _(Type, innerMetadata).reviver('', js);
};

var fromJS = function fromJS(Type, js) {
  return genericsFromJS(Type, [], js);
};

var ajvGenericsFromJS = function ajvGenericsFromJS(_, Type, schema, innerMetadata, js) {
  return _(Type, innerMetadata, schema).reviver('', js);
};

var ajvFromJS = function ajvFromJS(_, Type, schema, js) {
  return ajvGenericsFromJS(_, Type, schema, [], js);
};

var createAjvModel = function createAjvModel(ajv, innerTypes) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  options.metadata = ajvMetadata(ajv);

  return createModel(innerTypes, options);
};

var createSimpleModel = function createSimpleModel(innerTypes, name$$1) {
  return createModel(innerTypes, { stringTag: name$$1 });
};

var M = {
  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),

  Number: ModelicoNumber$1,
  Date: ModelicoDate$1,
  Enum: Enum,
  EnumMap: EnumMap$1,
  List: List$2,
  Map: ModelicoMap$1,
  StringMap: StringMap$1,
  Maybe: Maybe$1,
  Just: Maybe$1.Just,
  Nothing: Maybe$1.Nothing,
  Base: Base$1,
  Set: ModelicoSet$1,

  createModel: createModel,
  createSimpleModel: createSimpleModel,
  createAjvModel: createAjvModel,
  createUnionType: createUnionType,

  new: function _new(Type) {
    return function (x) {
      return new Type(x);
    };
  },
  fields: function fields(x) {
    return x[fieldsSymbol]();
  },
  symbols: symbols,

  fromJS: fromJS,
  genericsFromJS: genericsFromJS,
  fromJSON: function fromJSON(Type, json) {
    return fromJS(Type, JSON.parse(json));
  },
  genericsFromJSON: function genericsFromJSON(Type, innerMetadata, json) {
    return genericsFromJS(Type, innerMetadata, JSON.parse(json));
  },

  ajvFromJS: ajvFromJS,
  ajvGenericsFromJS: ajvGenericsFromJS,
  ajvFromJSON: function ajvFromJSON(_, Type, schema, json) {
    return ajvFromJS(_, Type, schema, JSON.parse(json));
  },
  ajvGenericsFromJSON: function ajvGenericsFromJSON(_, Type, schema, innerMetadata, json) {
    return ajvGenericsFromJS(_, Type, schema, innerMetadata, JSON.parse(json));
  },

  metadata: metadata$1,
  ajvMetadata: ajvMetadata,
  getSchema: getSchema,
  validate: validate,
  withValidation: withValidation,
  withCache: withCache,
  proxyMap: proxyMap,

  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, identity),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity),

  util: {
    T: T,
    always: always,
    formatAjvError: formatAjvError,
    identity: identity,
    isNothing: isNothing,
    partial: partial,
    pipe: pipe,
    mem: mem
  }
};

return M;

})));
