var version = "16.1.0";





var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

const typeSymbol = Symbol('type');
const fieldsSymbol = Symbol('fields');

//      

const get = (field        ) => { return (obj        ) => obj[field] };
const pipe2 = (fn1          , fn2          ) => { return (...args              ) => fn2(fn1(...args)) };


const partial = (fn          , ...args              ) => fn.bind(undefined, ...args);
// export const is = (Ctor: Object, val: Object) => val != null && val.constructor === Ctor || val instanceof Ctor;
const asIsReviver = (k        , v       ) => v;
const always = (x       ) => { return () => x };
const isNothing = (v       ) => v == null || v !== v;
const defaultTo = (d       ) => { return (v       ) => isNothing(v) ? d : v };
const objToArr = (obj        ) => { return Object.keys(obj).map(k => [k, obj[k]]) };
const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
const isPlainObject = (x       ) => typeof x === 'object' && !!x;

const getInnerTypes = Type => Type.innerTypes && Type.innerTypes() || {};

const reviverFactory$1 = Type => {
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
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.name} but got ${fields}`);
    }

    Object.freeze(fields);

    const innerTypes = getInnerTypes(Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(fields);

    new Set([...Object.keys(innerTypes), ...Object.keys(fields)])
      .forEach(key => {
        const valueCandidate = fields[key];
        const innerType = innerTypes[key];
        let value = valueCandidate;

        if (isNothing(valueCandidate) && innerType) {
          if (innerType.type !== Maybe$1) {
            throw TypeError(`no value for key ${key}`);
          }

          value = Maybe$1.of(null);
        }

        thisArg[key] = always(value);
      });
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
    return JSON.parse(json, reviverFactory$1(Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: reviverFactory$1(Type)});
  }
}

var Modelico$1 = Object.freeze(Modelico);

const reviverFactory = itemMetadata => { return (k, v) => {
  if (k !== '') {
    return v;
  }

  const maybeValue = (v === null) ? null : itemMetadata.reviver(k, v);

  return new Maybe(maybeValue);
}};

class Nothing {
  toJSON() {
    return null;
  }
}

class Just {
  constructor(v) {
    this.get = always(v);

    Object.freeze(this);
  }

  toJSON() {
    const v = this.get();

    return (v.toJSON) ? v.toJSON() : v;
  }
}

const nothing = new Nothing();

class Maybe extends Modelico$1 {
  constructor(v) {
    super(Maybe, {});

    const inner = (isNothing(v)) ? nothing : new Just(v);
    this.inner = always(inner);

    Object.freeze(this);
  }

  set(field, v) {
    if (this.isEmpty()) {
      return new Maybe(null);
    }

    const item = this.inner().get();

    return new Maybe(item.set(field, v));
  }

  setPath(path, v) {
    if (path.length === 0) {
      return new Maybe(v);
    }

    const inner = this.isEmpty() ? null : this.inner().get().setPath(path, v);

    return new Maybe(inner);
  }

  isEmpty() {
    return (this.inner() === nothing);
  }

  getOrElse(v) {
    return this.isEmpty() ? v : this.inner().get();
  }

  map(f) {
    const v = this.isEmpty() ? null : f(this.inner().get());

    return new Maybe(v);
  }

  toJSON() {
    return this.inner().toJSON();
  }

  static of(v) {
    return new Maybe(v);
  }

  static metadata(itemMetadata) {
    return Object.freeze({type: Maybe, reviver: reviverFactory(itemMetadata)});
  }
}

var Maybe$1 = Object.freeze(Maybe);

class AbstractMap extends Modelico$1 {
  constructor(Type, innerMapOrig) {
    super(Type, {});

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map');
    }

    const innerMap = new Map(innerMapOrig);

    this.inner = () => new Map(innerMap);
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value);
    }

    const item = this.inner().get(path[0]);

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const newMap = this.inner();
    newMap.set(key, value);

    return new Type(newMap);
  }

  static metadata(Type, reviver) {
    return Object.freeze({type: Type, reviver});
  }
}

var AbstractMap$1 = Object.freeze(AbstractMap);

var AsIs = Type => Object.freeze({type: Type, reviver: asIsReviver});

var Any = Object.freeze({name: 'Any'});

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = (keyMetadata, valueMetadata) => { return pairObject => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', pairObject.key);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', pairObject.value);

  return [key, val];
}};

const reviverFactory$2 = (keyMetadata, valueMetadata) => { return (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ?
    null :
    new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

  return new ModelicoMap(innerMap);
}};

class ModelicoMap extends AbstractMap$1 {
  constructor(innerMap) {
    super(ModelicoMap, innerMap);

    Object.freeze(this);
  }

  set(key, value) {
    return AbstractMap$1.set.call(this, ModelicoMap, key, value);
  }

  toJSON() {
    return [...this.inner()].map(stringifyMapper);
  }

  static fromMap(map) {
    return new ModelicoMap(map);
  }

  static fromArray(pairs) {
    return ModelicoMap.fromMap(new Map(pairs));
  }

  static of(...arr) {
    const len = arr.length;

    if (len % 2 === 1) {
      throw TypeError('Map.of requires an even number of arguments');
    }

    const pairs = [];

    for (let i = 0; i < len; i += 2) {
      pairs.push([arr[i], arr[i + 1]]);
    }

    return ModelicoMap.fromArray(pairs);
  }

  static fromObject(obj) {
    return ModelicoMap.fromArray(objToArr(obj));
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap$1.metadata(ModelicoMap, reviverFactory$2(keyMetadata, valueMetadata));
  }
}

ModelicoMap.EMPTY = ModelicoMap.fromArray([]);

var ModelicoMap$1 = Object.freeze(ModelicoMap);

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

const parseMapper$1 = (keyMetadata, valueMetadata, object) => { return enumerator => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', enumerator);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', object[enumerator]);

  return [key, val];
}};

const reviverFactory$3 = (keyMetadata, valueMetadata) => { return (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ?
    null :
    new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

  return new ModelicoEnumMap(innerMap);
}};

class ModelicoEnumMap extends AbstractMap$1 {
  constructor(innerMap) {
    super(ModelicoEnumMap, innerMap);

    Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap$1.set.call(this, ModelicoEnumMap, enumerator, value);
  }

  toJSON() {
    return [...this.inner()].reduce(stringifyReducer, {});
  }

  static fromMap(map) {
    return new ModelicoEnumMap(map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap$1.metadata(ModelicoEnumMap, reviverFactory$3(keyMetadata, valueMetadata));
  }
}

ModelicoEnumMap.EMPTY = ModelicoEnumMap.fromMap(new Map([]));

var EnumMap = Object.freeze(ModelicoEnumMap);

class ModelicoDate extends Modelico$1 {
  constructor(dateOrig) {
    super(ModelicoDate, {});

    if (isNothing(dateOrig)) {
      throw TypeError('missing date');
    }

    const date = new Date(dateOrig.getTime());

    this.inner = () => new Date(date.getTime());

    Object.freeze(this);
  }

  set(date) {
    return new ModelicoDate(date);
  }

  setPath(path, value) {
    return this.set(value);
  }

  toJSON() {
    return this.inner().toISOString();
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

const iterableReviverFactory = (IterableType, itemMetadata) => { return (k, v) => {
  if (k !== '') {
    return v;
  }

  const revive = partial(itemMetadata.reviver, k);
  const iterable = (v === null) ? null : v.map(revive);

  return new IterableType(iterable);
}};

const iterableMetadata = (IterableType, itemMetadata) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};

class ModelicoList extends Modelico$1 {
  constructor(innerListOrig) {
    super(ModelicoList, {});

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list');
    }

    const innerList = [...innerListOrig];

    this.inner = () => [...innerList];
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    Object.freeze(this);
  }

  set(index, value) {
    const newList = this.inner();
    newList[index] = value;

    return new ModelicoList(newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(value);
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
    return new ModelicoList(arr);
  }

  static of(...arr) {
    return ModelicoList.fromArray(arr);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoList, itemMetadata);
  }
}

ModelicoList.EMPTY = ModelicoList.of();

var List = Object.freeze(ModelicoList);

class ModelicoSet extends Modelico$1 {
  constructor(innerSetOrig) {
    super(ModelicoSet, {});

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set');
    }

    const innerSet = new Set(innerSetOrig);

    this.inner = () => new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    Object.freeze(this);
  }

  set(index, value) {
    const newSet = [...this.inner()];
    newSet[index] = value;

    return new ModelicoSet(newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(value);
    }

    const item = [...this.inner()][path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return [...this.inner()];
  }

  static fromArray(arr) {
    return ModelicoSet.fromSet(new Set(arr));
  }

  static of(...arr) {
    return ModelicoSet.fromArray(arr);
  }

  static fromSet(set) {
    return new ModelicoSet(set);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoSet, itemMetadata);
  }
}

ModelicoSet.EMPTY = ModelicoSet.of();

var ModelicoSet$1 = Object.freeze(ModelicoSet);

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

const reviverFactory$4 = enumerators => { return (k, v) => {
  const enumerator = enumerators[v];

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator (${v})`);
  }

  return enumerator;
}};

class ModelicoEnum extends Modelico$1 {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(ModelicoEnum, enumerators);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => this[enumerator]().toJSON = always(enumerator));

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: ModelicoEnum,
        reviver: reviverFactory$4(enumerators)
      })),
      enumerable: false
    });

    Object.freeze(this);
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

const metadata = Object.freeze({
  _: Modelico$1.metadata,
  any: Any,
  asIs: AsIs,
  date: ModelicoDate$1.metadata,
  enumMap: EnumMap.metadata,
  list: List.metadata,
  map: ModelicoMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata,
});

var index = Object.freeze({
  about: Object.freeze({ version, author, homepage, license }),
  Any,
  AsIs,
  Date: ModelicoDate$1,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap$1,
  Maybe: Maybe$1,
  Modelico: Modelico$1,
  Set: ModelicoSet$1,
  fields: x => x[fieldsSymbol](),
  metadata,
  proxyMap: partial(proxyFactory$1, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory$1, listNonMutators, listMutators),
  proxySet: partial(proxyFactory$1, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory$1, dateNonMutators, dateMutators)
});

export default index;
