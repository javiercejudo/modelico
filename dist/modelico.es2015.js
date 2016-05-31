var version = "14.1.0";
var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";
var homepage = "https://github.com/javiercejudo/modelico#readme";

const get = field => obj => obj[field];
const pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));

const partial = (fn, ...args) => fn.bind(undefined, ...args);
const asIsReviver = (k, v) => v;
const always = x => () => x;
const defaultTo = fallback => optional => (optional === undefined) ? fallback : optional;
const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
const isPlainObject = x => typeof x === 'object' && !!x;

const reviverFactory = Type => {
  const innerTypes = Type.innerTypes && Type.innerTypes() || {};

  return (k, v) => {
    if (k !== '') {
      return v;
    }

    const fields = !isPlainObject(v) ? v : Object.keys(v).reduce((acc, field) => {
      const metadata = innerTypes[field];

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

class Modelico {
  constructor(Type, fields, thisArg) {
    thisArg = defaultTo(this)(thisArg);
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
    return new Modelico(Type, fields, thisArg);
  }

  static fromJSON(Type, json) {
    return JSON.parse(json, reviverFactory(Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: reviverFactory(Type)});
  }
}

var Modelico$1 = Object.freeze(Modelico);

class AbstractMap extends Modelico$1 {
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

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.innerMap();
    newMap.set(key, value);

    return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  static metadata(Type, reviver) {
    return Object.freeze({type: Type, reviver});
  }
}

var AbstractMap$1 = Object.freeze(AbstractMap);

var AsIs = Type => Object.freeze({type: Type, reviver: asIsReviver});

var Any = Object.freeze({name: 'Any'});

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = (keyMetadata, valueMetadata) => pairObject => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', pairObject.key);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', pairObject.value);

  return [key, val];
};

const reviverFactory$1 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

  return new ModelicoMap(keyMetadata, valueMetadata, innerMap);
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

    return (innerMap === null) ? null : [...innerMap].map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(AsIs(String), AsIs(Any), map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap$1.metadata(ModelicoMap, reviverFactory$1(keyMetadata, valueMetadata));
  }
}

var ModelicoMap$1 = Object.freeze(ModelicoMap);

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

const parseMapper$1 = (keyMetadata, valueMetadata, object) => (enumerator, index) => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', enumerator);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', object[enumerator]);

  return [key, val];
};

const reviverFactory$2 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

  return new ModelicoEnumMap(keyMetadata, valueMetadata, innerMap);
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

    return (innerMap === null) ? null : [...innerMap].reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$2(keyMetadata, valueMetadata));
  }
}

var EnumMap = Object.freeze(ModelicoEnumMap);

class ModelicoDate extends Modelico$1 {
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

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const revive = partial(itemMetadata.reviver, k);
  const iterable = (v === null) ? null : v.map(revive);

  return new IterableType(itemMetadata, iterable);
};

const iterableMetadata = (IterableType, itemMetadata) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};

class ModelicoList extends Modelico$1 {
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

    if (!item.setPath) {
      return this.set(path[0], value);
    }

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

class ModelicoSet extends Modelico$1 {
  constructor(itemMetadata, innerSet) {
    super(ModelicoSet, {innerSet});

    this.itemMetadata = always(itemMetadata);
    this.innerSet = () => (innerSet === null) ? null : new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = [...this.innerSet()];
    newSet[index] = value;

    return new ModelicoSet(this.itemMetadata(), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(this.itemMetadata(), value);
    }

    const item = [...this.innerSet()][path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this.fields().innerSet;

    return (innerSet === null) ? null : [...innerSet];
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

const reviverFactory$3 = enumerators => (k, v) => {
  return (v === null) ? null : enumerators[v];
};

class ModelicoEnum extends Modelico$1 {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(ModelicoEnum, enumerators);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => this[enumerator]().toJSON = always(enumerator));

    this.metadata = always(Object.freeze({
      type: ModelicoEnum,
      reviver: reviverFactory$3(enumerators)
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

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, innerAccessor, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  return (...args) => {
    return candidate.apply(inner, args);
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

const internalNonMutators = ['set', 'setPath'];

const mapNonMutators = internalNonMutators;
const mapMutators = ['set', 'delete', 'clear'];

const setNonMutators = internalNonMutators;
const setMutators = ['add', 'delete', 'clear'];

const listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
const listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

const dateNonMutators = internalNonMutators;
const dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

var index = Object.freeze({
  about: Object.freeze({ version, author, homepage, license }),
  Any,
  AsIs,
  Date: ModelicoDate$1,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap$1,
  Modelico: Modelico$1,
  Set: ModelicoSet$1,
  proxyMap: partial(proxyFactory$1, mapNonMutators, mapMutators, 'innerMap'),
  proxyList: partial(proxyFactory$1, listNonMutators, listMutators, 'innerList'),
  proxySet: partial(proxyFactory$1, setNonMutators, setMutators, 'innerSet'),
  proxyDate: partial(proxyFactory$1, dateNonMutators, dateMutators, 'date')
});

export default index;