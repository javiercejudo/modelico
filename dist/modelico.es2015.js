var version = "15.0.0";
var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";
var homepage = "https://github.com/javiercejudo/modelico#readme";

const typeSymbol = Symbol('type');
const fieldsSymbol = Symbol('fields');
const innerTypesSymbol = Symbol('innerTypes');
const itemMetadataSymbol = Symbol('itemMetadata');

const get = field => obj => obj[field];
const pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));

const partial = (fn, ...args) => fn.bind(undefined, ...args);
const asIsReviver = (k, v) => v;
const always = x => () => x;
const defaultTo = fallback => optional => (optional === undefined) ? fallback : optional;
const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
const isPlainObject = x => typeof x === 'object' && !!x;

const getInnerTypes = Type => Type.innerTypes && Type.innerTypes() || {};

const reviverFactory = Type => {
  const innerTypes = getInnerTypes(Type);

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
    const innerTypes = getInnerTypes(Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(Object.freeze(fields));

    new Set([...Object.keys(innerTypes), ...Object.keys(fields)])
      .forEach(key => thisArg[key] = always(fields[key]));

    return thisArg;
  }

  set(field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value});

    return new (this[typeSymbol]())(newFields);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value);
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
    return this[fieldsSymbol]();
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
    super(Type, {});

    this.inner = () => (innerMap === null) ? null : new Map(innerMap);
    this[innerTypesSymbol] = always(Object.freeze({keyMetadata, valueMetadata}));
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();

    return this;
  }

  setPath(path, value) {
    if (path.length === 0) {
      const { keyMetadata, valueMetadata } = this[innerTypesSymbol]();

      return new (this[typeSymbol]())(keyMetadata, valueMetadata, value);
    }

    const item = this.inner().get(path[0]);

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const { keyMetadata, valueMetadata } = this[innerTypesSymbol]();
    const newMap = this.inner();
    newMap.set(key, value);

    return new Type(keyMetadata, valueMetadata, newMap);
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
    const innerMap = this.inner();

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

const parseMapper$1 = (keyMetadata, valueMetadata, object) => enumerator => {
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
    const innerMap = this.inner();

    return (innerMap === null) ? null : [...innerMap].reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$2(keyMetadata, valueMetadata));
  }
}

var EnumMap = Object.freeze(ModelicoEnumMap);

class ModelicoDate extends Modelico$1 {
  constructor(date) {
    super(ModelicoDate, {});

    this.inner = () => date === null ? null : new Date(date.getTime());

    return Object.freeze(this);
  }

  set(date) {
    return new ModelicoDate(date);
  }

  setPath(path, value) {
    return this.set(value);
  }

  toJSON() {
    const date = this.inner();

    return (date === null) ? null : date.toISOString();
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
  constructor(itemMetadata, inner) {
    super(ModelicoList, {});

    this[itemMetadataSymbol] = always(itemMetadata);
    this.inner = () => (inner === null) ? null : inner.slice();
    this[Symbol.iterator] = () => inner[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newList = this.inner();
    newList[index] = value;

    return new ModelicoList(this[itemMetadataSymbol](), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(this[itemMetadataSymbol](), value);
    }

    const item = this.inner()[path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this.inner();
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
    super(ModelicoSet, {});

    this[itemMetadataSymbol] = always(itemMetadata);
    this.inner = () => (innerSet === null) ? null : new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = [...this.inner()];
    newSet[index] = value;

    return new ModelicoSet(this[itemMetadataSymbol](), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(this[itemMetadataSymbol](), value);
    }

    const item = [...this.inner()][path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this.inner();

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

const proxyToSelf = (nonMutators, mutators, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  return (...args) => {
    return candidate.apply(inner, args);
  };
};

proxyFactory = (nonMutators, mutators, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, target, prop);
    }

    const inner = target.inner();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, target, prop);
    }

    return candidate;
  };

  return new Proxy(obj, {get});
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
  fields: x => x[fieldsSymbol](),
  proxyMap: partial(proxyFactory$1, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory$1, listNonMutators, listMutators),
  proxySet: partial(proxyFactory$1, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory$1, dateNonMutators, dateMutators)
});

export default index;