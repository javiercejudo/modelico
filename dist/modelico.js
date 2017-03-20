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

var version = "21.6.0";






var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

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

// @flow

var get$$1 = function get$$1(field /* : string */) {
  return function (obj /* : Object */) {
    return obj[field];
  };
};
var pipe2 = function pipe2(f /* : Function */, g /* : Function */) {
  return function () {
    return (/* : Array<mixed> */g(f.apply(undefined, arguments))
    );
  };
};
var not = function not(x /* : boolean */) {
  return (/* : boolean */!x
  );
};

var T = function T() {
  return true;
};
var identity = /* :: <T> */function identity(x /* : T */) {
  return (/* : T */x
  );
};
var pipe = function pipe() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return (/* : Array<Function> */[].concat(fns, [identity]).reduce(pipe2)
  );
};
var partial = function partial(fn /* : Function */) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return (/* : Array<mixed> */fn.bind.apply(fn, [undefined].concat(args))
  );
};
var asIsReviver = function asIsReviver(transform /* : Function */) {
  return function (k /* : string */, v /* : mixed */) {
    return transform(v);
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

var assertSomethingIdentity = /* :: <T> */function assertSomethingIdentity(x /* : T */) /* : T */{
  if (isNothing(x)) {
    throw TypeError('expected a value but got nothing (null, undefined or NaN)');
  }

  return x;
};

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
var reviverOrAsIs = pipe2(get$$1('reviver'), defaultTo(asIsReviver(assertSomethingIdentity)));
var isPlainObject = function isPlainObject(x /* : mixed */) {
  return (/* : boolean */(typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && !!x
  );
};
var isFunction = function isFunction(x /* : mixed */) {
  return (/* : boolean */typeof x === 'function'
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

var equals = function equals(a /* : any */, b /* : any */) {
  return (/* : boolean */isSomething(a) && a.equals ? a.equals(b) : haveSameValues(a, b)
  );
};

var unsupported = function unsupported(message /* : string */) {
  throw Error(message);
};

var innerTypesCache = new WeakMap();

var getInnerTypes = function getInnerTypes(path /* : Array<any> */, Type /* : Function */) {
  if (!Type.innerTypes) {
    throw Error("missing static innerTypes for " + (Type.displayName || Type.name));
  }

  return Type.innerTypes(path, Type);
};

var getInnerTypes$1 = (function (path, Type) {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type));
  }

  return innerTypesCache.get(Type);
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

var metadataSchemaCache = new WeakMap();
var metadataRefCache = new WeakMap();

var state = {
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set()
};

var getSchemaImpl = function getSchemaImpl(metadata) {
  if (metadata.schema) {
    return metadata.schema();
  }

  if (!metadata.type || !metadata.type.innerTypes || Object.keys(getInnerTypes$1([], metadata.type)).length === 0) {
    return emptyObject;
  }

  var baseSchema = { type: 'object' };
  var innerTypes = metadata.type.innerTypes();

  var required = [];
  var properties = Object.keys(innerTypes).reduce(function (acc, fieldName) {
    var fieldMetadata = innerTypes[fieldName];
    var fieldSchema = getSchema(fieldMetadata, false);
    var schema = void 0;

    if (fieldMetadata.default === undefined) {
      required.push(fieldName);
      schema = fieldSchema;
    } else {
      schema = Object.assign({
        anyOf: [{ type: 'null' }, fieldSchema]
      }, fieldMetadata.type === M.Maybe ? undefined : { default: fieldMetadata.default });
    }

    return Object.assign(acc, defineProperty({}, fieldName, schema));
  }, {});

  var schema = Object.assign({}, baseSchema, { properties: properties });

  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
};

var getUsedDefinitions = function getUsedDefinitions() {
  var definitions = state.definitions,
      usedDefinitions = state.usedDefinitions;


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
    return metadataSchemaCache.get(metadata);
  }

  if (metadataRefCache.has(metadata)) {
    var _ref = metadataRefCache.get(metadata);
    state.usedDefinitions.add(_ref);
    return { $ref: '#/definitions/' + _ref };
  }

  if (topLevel) {
    state.nextRef = 1;
    state.definitions = {};
    state.usedDefinitions = new Set();
  }

  var ref = state.nextRef;

  metadataRefCache.set(metadata, ref);
  state.nextRef += 1;

  var schema = getSchemaImpl(metadata);
  metadataSchemaCache.set(metadata, schema);

  Object.assign(state.definitions, defineProperty({}, ref, schema));

  if (!topLevel) {
    return schema;
  }

  var definitions = getUsedDefinitions();

  if (Object.keys(definitions).length === 0) {
    return schema;
  }

  if (!definitions.hasOwnProperty(ref)) {
    return Object.assign(schema, { definitions: definitions });
  }

  return {
    definitions: Object.assign(definitions, defineProperty({}, ref, schema)),
    $ref: '#/definitions/' + ref
  };
};

var validate = (function (instance) {
  var innerMetadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

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
    // real usage would benefit from emoving it.
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
      } else if (isSomething(defaultCandidate)) {
        value = innerTypes[key].default;
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

var reviverFactory$2 = function reviverFactory(itemMetadata) {
  return function (k, v, path) {
    if (k !== '') {
      return v;
    }

    var metadata = isFunction(itemMetadata) ? itemMetadata(v, path) : itemMetadata;

    var revive = v === null ? always(null) : defaultTo(metadata.reviver)(metadata.maybeReviver);

    return new Maybe(revive(k, v, path));
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
    key: 'get',
    value: function get$$1(fieldOrFallbackPair) {
      var fallback = fieldOrFallbackPair[0];
      var field = fieldOrFallbackPair[1];
      var item = this.getOrElse(fallback);

      return item.get ? item.get(field) : item;
    }
  }, {
    key: 'set',
    value: function set$$1(field, v) {
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

      var item = this.isEmpty() ? fallback : this.inner().get();

      var inner = item.setIn ? item.setIn([field].concat(toConsumableArray(restPath)), v) : null;

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
    value: function equals$$1(other) {
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

      return equals(inner.get(), otherInner.get());
    }
  }, {
    key: Symbol.toStringTag,
    get: function get$$1() {
      return 'ModelicoMaybe';
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
      return Object.freeze({
        type: Maybe,
        subtypes: [itemMetadata],
        reviver: reviverFactory$2(itemMetadata),
        default: Maybe.of()
      });
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

var reviverFactory$3 = function reviverFactory(enumerators) {
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
        type: Ctor,
        enumerators: enumerators,
        reviver: reviverFactory$3(enumerators)
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
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
    }
  }]);
  return Enum;
}(Base$1);

Object.defineProperty(Enum, 'displayName', {
  value: 'Enum',
  writable: true
});

var set$1 = function set$$1(thisArg, Type, key, value) {
  var newMap = thisArg.inner();
  newMap.set(key, value);

  return Type.fromMap(newMap);
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

var metadata$1 = function metadata(Type, reviverFactory, keyMetadata, valueMetadata) {
  return Object.freeze({
    type: Type,
    subtypes: Object.freeze([keyMetadata, valueMetadata]),
    reviver: reviverFactory(keyMetadata, valueMetadata)
  });
};

var equalPairs = function equalPairs(pairA, pairB) {
  return pairA.every(function (pairPart, index) {
    return equals(pairPart, pairB[index]);
  });
};

var copy = function copy(map) {
  return new Map(map);
};

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

    var innerMap = copy(innerMapOrig);

    _this[innerOrigSymbol] = always(innerMap);
    _this.inner = function () {
      return copy(innerMap);
    };
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

      if (haveDifferentTypes(this, other) || this.size !== other.size) {
        return false;
      }

      var thisIter = this[Symbol.iterator]();
      var otherIter = other[Symbol.iterator]();

      for (var i = 0; i < this.size; i += 1) {
        var pair = thisIter.next().value;

        var areEqual = asUnordered ? other.has(pair[0]) && equals(pair[1], other.get(pair[0])) : equalPairs(pair, otherIter.next().value);

        if (!areEqual) {
          return false;
        }
      }

      return true;
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

var reviverFactory$4 = function reviverFactory(keyMetadata, valueMetadata) {
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
      return metadata$1(ModelicoMap, reviverFactory$4, keyMetadata, valueMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
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

var reviverFactory$5 = function reviverFactory(valueMetadata) {
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
      return metadata$1(StringMap, reviverFactory$5, valueMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
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

var reviverFactory$6 = function reviverFactory(keyMetadata, valueMetadata) {
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
      return metadata$1(EnumMap, reviverFactory$6, keyMetadata, valueMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
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

var ModelicoNumber = function (_Base) {
  inherits(ModelicoNumber, _Base);

  function ModelicoNumber() {
    var numberOrig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    classCallCheck(this, ModelicoNumber);

    var _this = possibleConstructorReturn(this, (ModelicoNumber.__proto__ || Object.getPrototypeOf(ModelicoNumber)).call(this, ModelicoNumber));

    if (!Number.isNaN(numberOrig) && isNothing(numberOrig)) {
      throw TypeError('missing number');
    }

    var number = Number(numberOrig);

    _this[innerOrigSymbol] = always(number);
    _this.inner = _this[innerOrigSymbol];

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
    key: Symbol.toPrimitive,
    value: function value(hint) {
      var innerNumber = this.inner();

      return hint === 'string' ? String(innerNumber) : innerNumber;
    }
  }, {
    key: 'valueOf',
    value: function valueOf() {
      return this.inner();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return String(this.inner());
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
      return Object.freeze({
        type: ModelicoNumber,
        reviver: reviver
      });
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

var reviver$1 = function reviver(k, v) {
  var date = v === null ? null : new Date(v);

  return new ModelicoDate(date);
};

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

    _this[innerOrigSymbol] = always(date);
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
    key: Symbol.toPrimitive,
    value: function value(hint) {
      var innerDate = this[innerOrigSymbol]();

      if (hint === 'number') {
        return Number(innerDate);
      }

      return hint === 'string' ? String(innerDate) : true;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return String(this.inner());
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
      return Object.freeze({
        type: ModelicoDate,
        reviver: reviver$1
      });
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

var iterableMetadata = function iterableMetadata(IterableType, itemMetadata) {
  return Object.freeze({
    type: IterableType,
    subtypes: Object.freeze([itemMetadata]),
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};

var iterableEquals = function iterableEquals(thisArg, other) {
  var asUnordered = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (thisArg === other) {
    return true;
  }

  if (haveDifferentTypes(thisArg, other) || thisArg.size !== other.size) {
    return false;
  }

  var thisIter = thisArg[Symbol.iterator]();
  var otherIter = other[Symbol.iterator]();

  for (var i = 0; i < thisArg.size; i += 1) {
    var item = thisIter.next().value;

    if (asUnordered) {
      if (!other.has(item)) {
        return false;
      }
    } else if (!equals(item, otherIter.next().value)) {
      return false;
    }
  }

  return true;
};

var EMPTY_LIST = void 0;

var List = function (_Base) {
  inherits(List, _Base);

  function List() {
    var innerList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    classCallCheck(this, List);

    var _this = possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, List));

    if (isNothing(innerList)) {
      throw TypeError('missing list');
    }

    if (EMPTY_LIST && innerList.length === 0) {
      var _ret;

      return _ret = EMPTY_LIST, possibleConstructorReturn(_this, _ret);
    }

    Object.freeze(innerList);

    _this.inner = always(innerList);
    _this[innerOrigSymbol] = _this.inner;
    _this.size = innerList.length;

    if (!EMPTY_LIST && _this.size === 0) {
      EMPTY_LIST = _this;
    }

    Object.freeze(_this);
    return _this;
  }

  createClass(List, [{
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
      return this.inner()[index];
    }
  }, {
    key: 'set',
    value: function set$$1(index, value) {
      var newList = [].concat(toConsumableArray(this));
      newList[index] = value;

      return List.fromArray(newList);
    }
  }, {
    key: 'setIn',
    value: function setIn(path, value) {
      if (path.length === 0) {
        return List.fromArray(value);
      }

      var _path = toArray(path),
          key = _path[0],
          restPath = _path.slice(1);

      var item = this.inner()[key];

      if (!item.setIn) {
        return this.set(key, value);
      }

      return this.set(key, item.setIn(restPath, value));
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.inner();
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
  }, {
    key: 'EMPTY',
    value: function EMPTY() {
      return EMPTY_LIST || List.of();
    }
  }]);
  return List;
}(Base$1);

List.displayName = 'List';

var List$1 = Object.freeze(List);

var EMPTY_SET = void 0;

var copy$1 = function copy(set$$1) {
  return new Set(set$$1);
};

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

    var innerSet = copy$1(innerSetOrig);

    _this[innerOrigSymbol] = always(innerSet);
    _this.inner = function () {
      return copy$1(innerSet);
    };
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
      return iterableMetadata(ModelicoSet, itemMetadata);
    }
  }, {
    key: 'innerTypes',
    value: function innerTypes() {
      return emptyObject;
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

var formatError = function formatError(ajv, schema, value) {
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  return ['Invalid JSON at "' + path.join(' -> ') + '". According to the schema\n', JSON.stringify(schema, null, 2) + '\n', 'the value (data path "' + ajv.errors.filter(function (e) {
    return e.dataPath !== '';
  }).map(function (error) {
    return error.dataPath;
  }) + '")\n', JSON.stringify(value, null, 2) + '\n'].concat(ajv.errors.map(function (error) {
    return error.message;
  })).join('\n');
};

var formatDefaultValueError = function formatDefaultValueError(ajv, schema, value) {
  return ['Invalid default value. According to the schema\n', JSON.stringify(schema, null, 2) + '\n', 'the default value\n', JSON.stringify(value, null, 2) + '\n'].concat(ajv.errors.map(function (error) {
    return error.message;
  })).join('\n');
};

var ajvMetadata = (function () {
  var ajv = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { validate: T };

  var metadata = M.metadata();
  var ajvMetadata = {};

  var _ = metadata._,
      base = metadata.base,
      asIs = metadata.asIs,
      any = metadata.any,
      anyOf = metadata.anyOf,
      string = metadata.string,
      number = metadata.number,
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
    return function (k, value, path) {
      if (k !== '') {
        return value;
      }

      var valid = schema === emptyObject ? true : ajv.validate(schema, valueTransformer(value));

      if (!valid) {
        throw TypeError(formatError(ajv, schema, value, path));
      }

      var resolvedMetadata = isFunction(metadata) ? metadata(value, path) : metadata;

      return resolvedMetadata.reviver('', value, path);
    };
  };

  var ensureWrapped = function ensureWrapped(metadata, schema1, schema2) {
    return function (k, value) {
      if (k !== '') {
        return value;
      }

      var unwrappedValue = ensure(metadata, schema1)(k, value);

      return ensure(any(), schema2, function (x) {
        return x.inner();
      })(k, unwrappedValue);
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

    return Object.assign({}, baseMetadata, { reviver: reviver, ownSchema: always(schemaToCheck), schema: schemaGetter });
  };

  ajvMetadata.ajvMeta = ajvMeta;

  ajvMetadata.ajv_ = function (Type) {
    var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;
    var innerMetadata = arguments[2];

    var metadata = _(Type, innerMetadata);

    return ajvMeta(metadata, emptyObject, schema, function () {
      return getSchema(metadata, false);
    });
  };

  ajvMetadata.ajvBase = function (Type) {
    var schema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;

    var metadata = base(Type);

    return ajvMeta(metadata, { type: 'object' }, schema, function () {
      return getSchema(metadata, false);
    });
  };

  ajvMetadata.ajvAsIs = function (schema) {
    var transformer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;
    return ajvMeta(asIs(transformer), schema);
  };

  ajvMetadata.ajvAny = function (schema) {
    return ajvMetadata.ajvAsIs(schema);
  };

  ajvMetadata.ajvNumber = function (schema) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : emptyObject;
    var _options$wrap = options.wrap,
        wrap = _options$wrap === undefined ? false : _options$wrap;

    var metadata = number(options);

    if (!wrap) {
      return ajvMeta(metadata, { type: 'number' }, schema);
    }

    var numberMeta = Object.assign({ type: 'number' }, schema);

    var reviver = ensureWrapped(metadata, {
      anyOf: [{ type: 'number' }, { enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }]
    }, numberMeta);

    return Object.assign({}, metadata, { reviver: reviver, ownSchema: always(numberMeta), schema: always(numberMeta) });
  };

  ajvMetadata.ajvString = function (schema) {
    return ajvMeta(string(), { type: 'string' }, schema);
  };

  ajvMetadata.ajvBoolean = function (schema) {
    return ajvMeta(boolean(), { type: 'boolean' }, schema);
  };

  ajvMetadata.ajvDate = function (schema) {
    return ajvMeta(date(), { type: 'string', format: 'date-time' }, schema);
  };

  ajvMetadata.ajvEnum = function (Type) {
    var metadata = _(Type);

    return ajvMeta(metadata, { enum: Object.keys(metadata.enumerators) });
  };

  ajvMetadata.ajvEnumMap = function (schema, keyMetadata, valueMetadata) {
    var enumeratorsKeys = Object.keys(keyMetadata.enumerators);
    var keysRegex = '^(' + enumeratorsKeys.join('|') + ')$';

    return ajvMeta(enumMap(keyMetadata, valueMetadata), {
      type: 'object',
      maxProperties: enumeratorsKeys.length,
      additionalProperties: false,
      patternProperties: defineProperty({}, keysRegex, {})
    }, schema, function () {
      return {
        patternProperties: defineProperty({}, keysRegex, getSchema(valueMetadata, false))
      };
    });
  };

  var ajvList = function ajvList(schema, itemMetadata) {
    return ajvMeta(list(itemMetadata), { type: 'array' }, schema, function () {
      return { items: getSchema(itemMetadata, false) };
    });
  };

  var ajvTuple = function ajvTuple(schema, itemsMetadata) {
    var length = itemsMetadata.length;

    return ajvMeta(list(itemsMetadata), {
      type: 'array',
      minItems: length,
      maxItems: length
    }, schema, function () {
      return { items: itemsMetadata.map(function (itemMetadata) {
          return getSchema(itemMetadata, false);
        }) };
    });
  };

  ajvMetadata.ajvList = function (schema, itemMetadata) {
    return Array.isArray(itemMetadata) ? ajvTuple(schema, itemMetadata) : ajvList(schema, itemMetadata);
  };

  ajvMetadata.ajvMap = function (schema, keyMetadata, valueMetadata) {
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
          items: [getSchema(keyMetadata, false), getSchema(valueMetadata, false)]
        }, baseSchema.items)
      };
    };

    return ajvMeta(map(keyMetadata, valueMetadata), baseSchema, schema, keyValueSchemaGetter);
  };

  ajvMetadata.ajvStringMap = function (schema, valueMetadata) {
    return ajvMeta(stringMap(valueMetadata), { type: 'object' }, schema, function () {
      return {
        additionalProperties: false,
        patternProperties: { '.*': getSchema(valueMetadata, false) }
      };
    });
  };

  ajvMetadata.ajvSet = function (schema, itemMetadata) {
    return ajvMeta(set$$1(itemMetadata), {
      type: 'array',
      uniqueItems: true
    }, schema, function () {
      return { items: getSchema(itemMetadata, false) };
    });
  };

  ajvMetadata.ajvMaybe = function (itemMetadata) {
    return ajvMeta(maybe(itemMetadata), emptyObject, emptyObject, function () {
      return getSchema(itemMetadata, false);
    });
  };

  ajvMetadata.ajvWithDefault = function (metadata, defaultValue) {
    var schema = getSchema(metadata, false);
    var valid = ajv.validate(schema, defaultValue);

    if (!valid) {
      throw TypeError(formatDefaultValueError(ajv, schema, defaultValue));
    }

    return ajvMeta(withDefault(metadata, defaultValue), {
      default: defaultValue
    }, emptyObject, always(schema));
  };

  ajvMetadata.ajvAnyOf = function (conditionedMetas, enumField) {
    return ajvMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(function (conditionMeta) {
        return getSchema(conditionMeta[0], false);
      })
    });
  };

  return Object.freeze(Object.assign(ajvMetadata, metadata));
});

var asIs = (function () {
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

var internalNonMutators = ['set', 'setIn'];

var mapNonMutators = internalNonMutators;
var mapMutators = ['delete', 'clear'];

var setNonMutators = internalNonMutators;
var setMutators = ['add', 'delete', 'clear'];

var listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
var listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

var dateNonMutators = internalNonMutators;
var dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

var metadataCache = new WeakMap();

var base = function base(Type) {
  return Object.freeze({ type: Type, reviver: reviverFactory(Type) });
};

var raw_ = function raw_(Type, innerMetadata) {
  return Type.metadata ? Type.metadata.apply(Type, toConsumableArray(innerMetadata)) : base(Type);
};

var _ = function _(Type) {
  var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (metadata.length > 0) {
    return raw_(Type, metadata);
  }

  if (!metadataCache.has(Type)) {
    metadataCache.set(Type, raw_(Type, metadata));
  }

  return metadataCache.get(Type);
};

var metadata = function metadata() {
  return Object.freeze({
    _: _,
    base: base,
    asIs: asIs,
    any: any,
    anyOf: anyOf,
    number: function number() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$wrap = _ref.wrap,
          wrap = _ref$wrap === undefined ? false : _ref$wrap;

      return wrap ? ModelicoNumber$1.metadata() : asIs(Number);
    },

    string: always(asIs(String)),
    boolean: always(asIs(Boolean)),

    date: ModelicoDate$1.metadata,
    enumMap: EnumMap$1.metadata,
    list: List$1.metadata,
    map: ModelicoMap$1.metadata,
    stringMap: StringMap$1.metadata,
    maybe: Maybe$1.metadata,
    set: ModelicoSet$1.metadata,

    withDefault: function withDefault(metadata, def) {
      var defaultValue = reviverOrAsIs(metadata)('', def);

      return Object.freeze(Object.assign({}, metadata, { default: defaultValue }));
    }
  });
};

var proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity);
var genericsFromJS = function genericsFromJS(Type, innerMetadata, js) {
  return _(Type, innerMetadata).reviver('', js);
};
var fromJS = function fromJS(Type, js) {
  return genericsFromJS(Type, [], js);
};
var ajvGenericsFromJS = function ajvGenericsFromJS(_, Type, schema, innerMetadata, js) {
  return _(Type, schema, innerMetadata).reviver('', js);
};
var ajvFromJS = function ajvFromJS(_, Type, schema, js) {
  return ajvGenericsFromJS(_, Type, schema, [], js);
};

var createModel = function createModel(_innerTypes) {
  var stringTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ModelicoModel';

  return function (_Base) {
    inherits(_class, _Base);

    function _class() {
      classCallCheck(this, _class);
      return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    createClass(_class, [{
      key: Symbol.toStringTag,
      get: function get$$1() {
        return stringTag;
      }
    }], [{
      key: 'innerTypes',
      value: function innerTypes(path, Type) {
        return typeof _innerTypes === 'function' ? _innerTypes(path, Type) : Object.freeze(_innerTypes);
      }
    }]);
    return _class;
  }(Base$1);
};

var M = {
  about: Object.freeze({ version: version, author: author, homepage: homepage, license: license }),
  Number: ModelicoNumber$1,
  Date: ModelicoDate$1,
  Enum: Enum,
  EnumMap: EnumMap$1,
  List: List$1,
  Map: ModelicoMap$1,
  StringMap: StringMap$1,
  Maybe: Maybe$1,
  Base: Base$1,
  Set: ModelicoSet$1,
  createModel: createModel,
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
  metadata: metadata,
  ajvMetadata: ajvMetadata,
  getSchema: getSchema,
  validate: validate,
  withValidation: withValidation,
  proxyMap: proxyMap,
  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, function (x) {
    return [].concat(toConsumableArray(x));
  }),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
};

return M;

})));
