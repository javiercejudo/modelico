(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Modelico = factory());
}(this, function () { 'use strict';

	var version = "12.6.0";
	var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
	var license = "MIT";
	var homepage = "https://github.com/javiercejudo/modelico#readme";

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

	const always = x => () => x;
	const defaultTo = (fallback, optional) => (optional === undefined) ? fallback : optional;
	const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
	const reviverOrAsIs = metadata => (metadata.reviver || asIsReviver);

	const mergeDeepInnerTypes = (acc, Type) => {
	  if (!Type.innerTypes) {
	    return acc;
	  }

	  const innerTypes = Type.innerTypes();

	  const result = Object.keys(innerTypes).reduce((localAcc, key) => {
	    localAcc = mergeDeepInnerTypes(acc, innerTypes[key].type);

	    if (localAcc.hasOwnProperty(key) && acc[key].type.name !== innerTypes[key].type.name) {
	      throw new TypeError(`Duplicated typed key '${key}' with types ${acc[key].type.name} and ${innerTypes[key].type.name}`);
	    }

	    localAcc[key] = innerTypes[key];

	    return localAcc;
	  }, {});

	  return result;
	};

	const reviverFactory = Type => {
	  const innerTypes = mergeDeepInnerTypes({}, Type);

	  return (k, v) => {
	    if (k === '') {
	      return new Type(v);
	    }

	    const innerTypeMetadata = innerTypes[k];

	    if (innerTypeMetadata) {
	      return reviverOrAsIs(innerTypeMetadata)('', v);
	    }

	    return v;
	  };
	};

	class Modelico$1 {
	  constructor(Type, fields, thisArg) {
	    thisArg = defaultTo(this, thisArg);
	    thisArg.type = always(Type);
	    thisArg.fields = always(Object.freeze(fields));

	    Object.getOwnPropertyNames(fields)
	      .forEach(field => thisArg[field] = always(fields[field]));

	    return thisArg;
	  }

	  set(field, value) {
	    const newFields = Object.assign({}, this.fields(), {[field]: value});

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
	    return new Modelico$1(Type, fields, thisArg);
	  }

	  static fromJSON(Type, json) {
	    return JSON.parse(json, reviverFactory(Type));
	  }

	  static metadata(Type) {
	    return Object.freeze({type: Type, reviver: reviverFactory(Type)});
	  }
	}

	var Modelico$2 = Object.freeze(Modelico$1);

	class AbstractMap extends Modelico$2 {
	  constructor(Type, keyMetadata, valueMetadata, innerMap) {
	    super(Type, {innerMap});

	    this.innerTypes = always(Object.freeze({keyMetadata, valueMetadata}));
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

	  static metadata(Type, reviverFactory, keyMetadata, valueMetadata) {
	    return Object.freeze({type: Type, reviver: reviverFactory({keyMetadata, valueMetadata})});
	  }
	}

	var AbstractMap$1 = Object.freeze(AbstractMap);

	var AsIs = Type => Object.freeze({type: Type, reviver: asIsReviver});

	var Any = Object.freeze({name: 'Any'});

	const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

	const parseMapper = innerTypes => pairObject => [
	  reviverOrAsIs(innerTypes.keyMetadata)('', pairObject.key),
	  reviverOrAsIs(innerTypes.valueMetadata)('', pairObject.value)
	];

	const reviverFactory$1 = innerTypes => (k, v) => {
	  if (k !== '') {
	    return v;
	  }

	  const innerMap = (v === null) ? null : new Map(v.map(parseMapper(innerTypes)));

	  return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
	};

	class ModelicoMap extends AbstractMap$1 {
	  constructor(keyMetadata, valueMetadata, innerMap) {
	    super(ModelicoMap, keyMetadata, valueMetadata, innerMap);

	    return Object.freeze(this);
	  }

	  set(enumerator, value) {
	    return AbstractMap$1.set.call(this, ModelicoMap, enumerator, value);
	  }

	  toJSON() {
	    const innerMap = this.fields().innerMap;

	    return (innerMap === null) ? null : Array.from(innerMap).map(stringifyMapper);
	  }

	  static fromObject(obj) {
	    return ModelicoMap.fromMap(new Map(objToArr(obj)));
	  }

	  static fromMap(map) {
	    return new ModelicoMap(AsIs(String), AsIs(Any), map);
	  }

	  static metadata(keyMetadata, valueMetadata) {
	    return AbstractMap$1.metadata(ModelicoMap, reviverFactory$1, keyMetadata, valueMetadata);
	  }
	}

	var ModelicoMap$1 = Object.freeze(ModelicoMap);

	const stringifyReducer = (acc, pair) => {
	  acc[pair[0].toJSON()] = pair[1];

	  return acc;
	};

	const parseMapper$1 = (innerTypes, object) => enumerator => [
	  reviverOrAsIs(innerTypes.keyMetadata)('', enumerator),
	  reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])
	];

	const reviverFactory$2 = innerTypes => (k, v) => {
	  if (k !== '') {
	    return v;
	  }

	  const innerMap = (v === null) ? null : new Map(Object.keys(v).map(parseMapper$1(innerTypes, v)));

	  return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
	};

	class ModelicoEnumMap extends AbstractMap$1 {
	  constructor(keyMetadata, valueMetadata, innerMap) {
	    super(ModelicoEnumMap, keyMetadata, valueMetadata, innerMap);

	    return Object.freeze(this);
	  }

	  set(enumerator, value) {
	    return AbstractMap$1.set.call(this, ModelicoEnumMap, enumerator, value);
	  }

	  toJSON() {
	    const innerMap = this.fields().innerMap;

	    return (innerMap === null) ? null : Array.from(innerMap).reduce(stringifyReducer, {});
	  }

	  static metadata(keyMetadata, valueMetadata) {
	    return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$2, keyMetadata, valueMetadata);
	  }
	}

	var EnumMap = Object.freeze(ModelicoEnumMap);

	class ModelicoDate extends Modelico$2 {
	  constructor(date) {
	    super(ModelicoDate, {date});

	    this.date = () => date === null ? null : new Date(date.getTime());

	    return Object.freeze(this);
	  }

	  set(date) {
	    return new ModelicoDate(date);
	  }

	  setPath(path, value) {
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

	var ModelicoDate$1 = Object.freeze(ModelicoDate);

	class ModelicoList extends Modelico$2 {
	  constructor(itemMetadata, innerList) {
	    super(ModelicoList, {innerList});

	    this.itemMetadata = always(itemMetadata);
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
	    return iterableMetadata(ModelicoList, itemMetadata);
	  }
	}

	var List = Object.freeze(ModelicoList);

	class ModelicoSet extends Modelico$2 {
	  constructor(itemMetadata, innerSet) {
	    super(ModelicoSet, {innerSet});

	    this.itemMetadata = always(itemMetadata);
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
	    return iterableMetadata(ModelicoSet, itemMetadata);
	  }
	}

	var ModelicoSet$1 = Object.freeze(ModelicoSet);

	const enumeratorsReducer = (acc, code) => (acc[code] = {code}) && acc;

	const reviver = (values, k, v) => {
	  return (v === null) ? null : values[v];
	};

	class ModelicoEnum extends Modelico$2 {
	  constructor(input) {
	    const enumerators = Array.isArray(input) ?
	      input.reduce(enumeratorsReducer, {}) :
	      input;

	    super(ModelicoEnum, enumerators);

	    Object.getOwnPropertyNames(enumerators)
	      .forEach(enumerator => this[enumerator]().toJSON = always(enumerator));

	    this.metadata = always(Object.freeze({
	      type: ModelicoEnum,
	      reviver: bind(reviver, enumerators)
	    }));

	    return Object.freeze(this);
	  }
	}

	var Enum = Object.freeze(ModelicoEnum);

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

	var proxyFactory$1 = proxyFactory;

	const bind3 = (fn, _1, _2, _3) => fn.bind(undefined, _1, _2, _3);
	const internalNonMutators = ['set', 'setPath'];

	const mapNonMutatorMethods = internalNonMutators;
	const mapMutatorMethods = [
	  "set",
	  "delete",
	  "clear"
	];

	const setNonMutatorMethods = internalNonMutators;
	const setMutatorMethods = [
	  "add",
	  "delete",
	  "clear"
	];

	const listNonMutatorMethods = internalNonMutators.concat([
	  "concat",
	  "slice",
	  "filter"
	]);
	const listMutatorMethods = [
	  "copyWithin",
	  "fill",
	  "pop",
	  "push",
	  "reverse",
	  "shift",
	  "sort",
	  "splice",
	  "unshift"
	];

	const dateNonMutatorMethods = internalNonMutators;
	const dateMutatorMethods = [
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
	];

	var Modelico = Object.freeze({
	  about: Object.freeze({ version, author, homepage, license }),
	  Any,
	  AsIs,
	  Date: ModelicoDate$1,
	  Enum,
	  EnumMap,
	  List,
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