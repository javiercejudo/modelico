(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=[
  "setDate",
  "setFullYear",
  "setHours",
  "setMinutes",
  "setMilliseconds",
  "setMonth",
  "setSeconds",
  "setTime",
  "setUTCDate",
  "setUTCFullYear",
  "setUTCHours",
  "setUTCMilliseconds",
  "setUTCMinutes",
  "setUTCMonth",
  "setUTCSeconds",
  "setYear"
]

},{}],2:[function(require,module,exports){
module.exports=[
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]

},{}],3:[function(require,module,exports){
module.exports=[
  "concat",
  "slice",
  "filter"
]

},{}],4:[function(require,module,exports){
module.exports=[
  "set",
  "delete",
  "clear"
]

},{}],5:[function(require,module,exports){
module.exports=[
  "add",
  "delete",
  "clear"
]

},{}],6:[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":18}],7:[function(require,module,exports){
'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class AbstractMap extends Modelico {
  constructor(Type, keyMetadata, valueMetadata, innerMap) {
    super(Type, {innerMap});

    this.innerTypes = U.always(Object.freeze({keyMetadata, valueMetadata}));
    this.innerMap = () => (innerMap === null) ? null : new Map(innerMap);
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();

    return this;
  }

  setPath(path, value) {
    if (path.length === 0) {
      const innerTypes = this.innerTypes();

      return new (this.type())(innerTypes.keyMetadata, innerTypes.keyMetadata, value);
    }

    const item = this.innerMap().get(path[0]);
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.innerMap();
    newMap.set(key, value);

    return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  static metadata(Type, reviver, keyMetadata, valueMetadata) {
    return Object.freeze({type: Type, reviver: U.bind(reviver, {keyMetadata, valueMetadata})});
  }
}

module.exports = Object.freeze(AbstractMap);

},{"./Modelico":15,"./U":17}],8:[function(require,module,exports){
'use strict';

module.exports = Object.freeze({});

},{}],9:[function(require,module,exports){
'use strict';

const U = require('./U');

module.exports = type => Object.freeze({type: type, reviver: U.asIsReviver});

},{"./U":17}],10:[function(require,module,exports){
'use strict';

const Modelico = require('./Modelico');

class ModelicoDate extends Modelico {
  constructor(date) {
    super(ModelicoDate, {date});

    this.date = () => date === null ? null : new Date(date.getTime());

    return Object.freeze(this);
  }

  set(date) {
    return new ModelicoDate(date);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return this.set(value);
    }

    return this.set(value);
  }

  toJSON() {
    return (this.date() === null) ? null : this.date().toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return new ModelicoDate(date);
  }

  static metadata() {
    return Object.freeze({type: ModelicoDate, reviver: ModelicoDate.reviver});
  }
}

module.exports = Object.freeze(ModelicoDate);

},{"./Modelico":15}],11:[function(require,module,exports){
'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

const enumeratorsReducer = (acc, code) => (acc[code] = {code}) && acc;

const reviver = (values, k, v) => {
  return (v === null) ? null : values[v];
};

class ModelicoEnum extends Modelico {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(ModelicoEnum, enumerators);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => this[enumerator]().toJSON = U.always(enumerator));

    this.metadata = U.always(Object.freeze({
      type: ModelicoEnum,
      reviver: U.bind(reviver, enumerators)
    }));

    return Object.freeze(this);
  }
}

module.exports = Object.freeze(ModelicoEnum);

},{"./Modelico":15,"./U":17}],12:[function(require,module,exports){
'use strict';

const U = require('./U');
const AbstractMap = require('./AbstractMap');

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

const parseMapper = (innerTypes, object) => enumerator => [
  U.reviverOrAsIs(innerTypes.keyMetadata)('', enumerator),
  U.reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])
];

const reviver = (innerTypes, k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(Object.keys(v).map(parseMapper(innerTypes, v)));

  return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
};

class ModelicoEnumMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, innerMap) {
    super(ModelicoEnumMap, keyMetadata, valueMetadata, innerMap);

    return Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoEnumMap, enumerator, value);
  }

  toJSON() {
    const innerMap = this.fields().innerMap;

    return (innerMap === null) ? null : Array.from(innerMap).reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoEnumMap, reviver, keyMetadata, valueMetadata);
  }
}

module.exports = Object.freeze(ModelicoEnumMap);

},{"./AbstractMap":7,"./U":17}],13:[function(require,module,exports){
'use strict';

const U = require('./U');
const Modelico = require('./Modelico');
const AsIs = require('./AsIs');
const Any = require('./Any');

class ModelicoList extends Modelico {
  constructor(itemMetadata, innerList) {
    super(ModelicoList, {innerList});

    this.itemMetadata = U.always(itemMetadata);
    this.innerList = () => (innerList === null) ? null : innerList.slice();
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newList = this.innerList();
    newList[index] = value;

    return new ModelicoList(this.itemMetadata(), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(this.itemMetadata(), value);
    }

    const item = this.innerList()[path[0]];

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this.fields().innerList;
  }

  static fromArray(arr) {
    return new ModelicoList(AsIs(Any), arr);
  }

  static metadata(itemMetadata) {
    return U.iterableMetadata(ModelicoList, itemMetadata);
  }
}

module.exports = Object.freeze(ModelicoList);

},{"./Any":8,"./AsIs":9,"./Modelico":15,"./U":17}],14:[function(require,module,exports){
'use strict';

const U = require('./U');
const AbstractMap = require('./AbstractMap');
const AsIs = require('./AsIs');
const Any = require('./Any');

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = innerTypes => pairObject => [
  U.reviverOrAsIs(innerTypes.keyMetadata)('', pairObject.key),
  U.reviverOrAsIs(innerTypes.valueMetadata)('', pairObject.value)
];

const reviver = (innerTypes, k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(v.map(parseMapper(innerTypes)));

  return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
};

class ModelicoMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, innerMap) {
    super(ModelicoMap, keyMetadata, valueMetadata, innerMap);

    return Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoMap, enumerator, value);
  }

  toJSON() {
    const innerMap = this.fields().innerMap;

    return (innerMap === null) ? null : Array.from(innerMap).map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(U.objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(AsIs(String), AsIs(Any), map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoMap, reviver, keyMetadata, valueMetadata);
  }
}

module.exports = Object.freeze(ModelicoMap);

},{"./AbstractMap":7,"./Any":8,"./AsIs":9,"./U":17}],15:[function(require,module,exports){
'use strict';

const U = require('./U');

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

const reviver = (Type, k, v) => {
  if (k === '') {
    return new Type(v);
  }

  if (Type.innerTypes) {
    const innerTypeMetadata = Type.innerTypes()[k];

    if (innerTypeMetadata) {
      return U.reviverOrAsIs(innerTypeMetadata)('', v);
    }
  }

  return v;
};

class Modelico {
  constructor(Type, fields, thisArg) {
    thisArg = U.default(thisArg, this);
    thisArg.type = U.always(Type);
    thisArg.fields = U.always(Object.freeze(fields));

    Object.getOwnPropertyNames(fields)
      .forEach(field => thisArg[field] = U.always(fields[field]));

    return thisArg;
  }

  set(field, value) {
    const newFields = Object.assign({}, this.fields(), assignReducer({}, {field, value}));

    return new (this.type())(newFields);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this.type())(value);
    }

    if (path.length === 1) {
      return this.set(path[0], value);
    }

    return this.set(path[0], this[path[0]]().setPath(path.slice(1), value));
  }

  equals(other) {
    return (JSON.stringify(this) === JSON.stringify(other));
  }

  toJSON() {
    return this.fields();
  }

  static factory(Type, fields, thisArg) {
    return new Modelico(Type, fields, thisArg);
  }

  static fromJSON(Type, json) {
    return JSON.parse(json, U.bind(reviver, Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: U.bind(reviver, Type)});
  }
}

module.exports = Object.freeze(Modelico);

},{"./U":17}],16:[function(require,module,exports){
'use strict';

const U = require('./U');
const Modelico = require('./Modelico');
const AsIs = require('./AsIs');
const Any = require('./Any');

class ModelicoSet extends Modelico {
  constructor(itemMetadata, innerSet) {
    super(ModelicoSet, {innerSet});

    this.itemMetadata = U.always(itemMetadata);
    this.innerSet = () => (innerSet === null) ? null : new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = Array.from(this.innerSet());
    newSet[index] = value;

    return new ModelicoSet(this.itemMetadata(), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(this.itemMetadata(), value);
    }

    const item = Array.from(this.innerSet())[path[0]];

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this.fields().innerSet;

    return (innerSet === null) ? null : Array.from(innerSet);
  }

  static fromArray(arr) {
    return ModelicoSet.fromSet(new Set(arr));
  }

  static fromSet(set) {
    return new ModelicoSet(AsIs(Any), set);
  }

  static metadata(itemMetadata) {
    return U.iterableMetadata(ModelicoSet, itemMetadata);
  }
}

module.exports = Object.freeze(ModelicoSet);

},{"./Any":8,"./AsIs":9,"./Modelico":15,"./U":17}],17:[function(require,module,exports){
'use strict';

const asIsReviver = (k, v) => v;
const bind = (fn, _1) => fn.bind(undefined, _1);

const iterableReviver = (IterableType, itemMetadata, k, v) => {
  if (k !== '') {
    return v;
  }

  const iterable = (v === null) ? null : v.map(bind(itemMetadata.reviver, k));

  return new IterableType(itemMetadata, iterable);
};

const iterableMetadata = (IterableType, itemMetadata, k, v) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviver.bind(undefined, IterableType, itemMetadata)
  });
};

module.exports = Object.freeze({
  always: x => () => x,
  bind,
  default: (optional, fallback) => (optional === undefined) ? fallback : optional,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]]),
  reviverOrAsIs: metadata => (metadata.reviver || asIsReviver),
  asIsReviver,
  iterableReviver,
  iterableMetadata
});

},{}],18:[function(require,module,exports){
'use strict';

const Modelico = require('./Modelico');
const ModelicoMap = require('./Map');
const EnumMap = require('./EnumMap');
const ModelicoDate = require('./Date');
const AsIs = require('./AsIs');
const List = require('./List');
const ModelicoSet = require('./Set');
const Enum = require('./Enum');
const Any = require('./Any');

const bind3 = (fn, _1, _2, _3) => fn.bind(undefined, _1, _2, _3);
const proxyFactory = require('./proxyFactory');
const internalNonMutators = ['set', 'setPath'];

const mapNonMutatorMethods = internalNonMutators;
const mapMutatorMethods = require('../data/mapMutators.json');

const setNonMutatorMethods = internalNonMutators;
const setMutatorMethods = require('../data/setMutators.json');

const listNonMutatorMethods = internalNonMutators.concat(require('../data/listNonMutators.json'));
const listMutatorMethods = require('../data/listMutators.json');

const dateNonMutatorMethods = internalNonMutators;
const dateMutatorMethods = require('../data/dateMutators.json');

module.exports = Object.freeze({
  Any,
  AsIs,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  Modelico,
  Set: ModelicoSet,
  proxyMap: bind3(proxyFactory, mapNonMutatorMethods, mapMutatorMethods, 'innerMap'),
  proxyList: bind3(proxyFactory, listNonMutatorMethods, listMutatorMethods, 'innerList'),
  proxySet: bind3(proxyFactory, setNonMutatorMethods, setMutatorMethods, 'innerSet'),
  proxyDate: bind3(proxyFactory, dateNonMutatorMethods, dateMutatorMethods, 'date')
});

},{"../data/dateMutators.json":1,"../data/listMutators.json":2,"../data/listNonMutators.json":3,"../data/mapMutators.json":4,"../data/setMutators.json":5,"./Any":8,"./AsIs":9,"./Date":10,"./Enum":11,"./EnumMap":12,"./List":13,"./Map":14,"./Modelico":15,"./Set":16,"./proxyFactory":19}],19:[function(require,module,exports){
'use strict';

// as `let` to prevent jshint from thinking we are using it before being declared,
// which is not the case
let proxyFactory;

const proxyToSelf = (nonMutators, mutators, innerAccessor, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return function() {
    const newObj = target[prop].apply(target, arguments);

    return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, innerAccessor, target, prop) => {
  if (nonMutators.includes(prop)) {
    return function() {
      const newObj = target.setPath([], candidate.apply(inner, arguments));

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return function() {
      candidate.apply(inner, arguments);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  return function() {
    return candidate.apply(inner, arguments);
  };
};

proxyFactory = (nonMutators, mutators, innerAccessor, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, innerAccessor, target, prop);
    }

    const inner = target[innerAccessor]();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, innerAccessor, target, prop);
    }

    return candidate;
  };

  // not using shortcut get due to https://github.com/nodejs/node/issues/4237
  return new Proxy(obj, {get: get});
};

module.exports = proxyFactory;

},{}]},{},[6])(6)
});