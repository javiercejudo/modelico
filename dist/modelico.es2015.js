var version = "19.0.4";





var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

const typeSymbol = Symbol('type');
const fieldsSymbol = Symbol('fields');

// @flow

const get = (field/* : string */) => (obj/* : Object */) => obj[field];
const pipe2 = (fn1/* : Function */, fn2/* : Function */) => (...args/* : Array<mixed> */) => fn2(fn1(...args));
const not = (x/* : boolean */)/* : boolean */ => !x;

const identity = /* :: <T> */(x/* : T */)/* : T */ => x;

const partial = (fn/* : Function */, ...args/* : Array<mixed> */) => fn.bind(undefined, ...args);
const asIsReviver = (Type/* : Function */) => (k/* : string */, v/* : mixed */) => Type(v);
const always = /* :: <T> */(x/* : T */) => ()/* : T */ => x;
const isNothing = (v/* : mixed */)/* : boolean */ => v == null || Number.isNaN(v);
const isSomething = pipe2(isNothing, not);
const defaultTo = (d/* : mixed */) => (v/* : mixed */) => isNothing(v) ? d : v;
const objToArr = (obj/* : Object */) => Object.keys(obj).map(k => [k, obj[k]]);
const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver(identity)));
const isPlainObject = (x/* : mixed */)/* : boolean */ => typeof x === 'object' && !!x;
const emptyObject = Object.freeze({});

const haveSameValues = (a/* : any */, b/* : any */)/* : boolean */ =>
  (a === b) || Object.is(a, b);

const haveSameType = (a/* : any */, b/* : any */)/* : boolean */ => (a == null || b == null)
  ? a === b
  : a.constructor === b.constructor;

const haveDifferentTypes = pipe2(haveSameType, not);

const equals = (a/* : any */, b/* : any */)/* : boolean */ =>
  (isSomething(a) && a.equals)
    ? a.equals(b)
    : haveSameValues(a, b);

const getInnerTypes = (depth/* : number */, Type/* : Function */) => {
  if (!Type.innerTypes) {
    throw Error(`missing static innerTypes for ${Type.displayName || Type.name}`)
  }

  return Type.innerTypes(depth + 1, Type)
};

const unsupported = (message/* : string */) => {
  throw Error(message)
};

const innerTypesCache = new WeakMap();

const getInnerTypesWithCache = (depth, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(depth, Type));
  }

  return innerTypesCache.get(Type)
};

const plainObjectReviverFactory = (depth, Type, k, v) =>
  Object.keys(v).reduce((acc, field) => {
    const innerTypes = getInnerTypesWithCache(depth, Type);

    const metadata = innerTypes[field];

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field]);
    } else {
      acc[field] = v[field];
    }

    return acc
  }, {});

const reviverFactory = (depth, Type) => (k, v) => {
  if (k !== '') {
    return v
  }

  const fields = isPlainObject(v)
    ? plainObjectReviverFactory(depth, Type, k, v)
    : v;

  return new Type(fields)
};

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    Object.freeze(fields);

    const innerTypes = getInnerTypes(0, Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(fields);

    Object.keys(innerTypes).forEach(key => {
      const valueCandidate = fields[key];
      let value = M.Maybe.EMPTY;

      if (isSomething(valueCandidate)) {
        value = valueCandidate;
      } else if (innerTypes[key].type !== M.Maybe) {
        throw TypeError(`no value for key "${key}"`)
      }

      thisArg[key] = always(value);
    });
  }

  set (field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value});

    return new (this[typeSymbol]())(newFields)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path;
    const item = this[key]();

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return (JSON.stringify(this) === JSON.stringify(other))
  }

  toJSON () {
    return this[fieldsSymbol]()
  }

  toJS () {
    return JSON.parse(JSON.stringify(this))
  }

  stringify (n) {
    return JSON.stringify(this, null, n)
  }

  static factory (...args) {
    return new Base(...args)
  }
}

var Base$1 = Object.freeze(Base);

const reviverFactory$2 = itemMetadata => (k, v) => {
  if (k !== '') {
    return v
  }

  const maybeValue = (v === null)
    ? null
    : itemMetadata.reviver(k, v);

  return new Maybe(maybeValue)
};

class Nothing {
  toJSON () {
    return null
  }
}

class Just {
  constructor (v) {
    this.get = always(v);

    Object.freeze(this);
  }

  toJSON () {
    const v = this.get();

    if (isNothing(v)) {
      return null
    }

    return (v.toJSON)
      ? v.toJSON()
      : v
  }
}

const nothing = new Nothing();

class Maybe extends Base$1 {
  constructor (v, nothingCheck = true) {
    super(Maybe);

    const inner = (nothingCheck && isNothing(v))
      ? nothing
      : new Just(v);

    this.inner = always(inner);

    Object.freeze(this);
  }

  set (field, v) {
    if (this.isEmpty()) {
      return this
    }

    const item = this.inner().get();

    if (isNothing(item)) {
      return this
    }

    const newItem = (item.set)
      ? item.set(field, v)
      : null;

    return new Maybe(newItem)
  }

  setPath (path, v) {
    if (path.length === 0) {
      return Maybe.of(v)
    }

    if (this.isEmpty()) {
      return this
    }

    const item = this.inner().get();

    if (isNothing(item)) {
      return this
    }

    const inner = (item.setPath)
      ? item.setPath(path, v)
      : null;

    return Maybe.of(inner)
  }

  isEmpty () {
    return (this.inner() === nothing)
  }

  getOrElse (v) {
    return this.isEmpty()
      ? v
      : this.inner().get()
  }

  map (f) {
    return this.isEmpty()
      ? this
      : Maybe.ofAny(f(this.inner().get()))
  }

  toJSON () {
    return this.inner().toJSON()
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const inner = this.inner();
    const otherInner = other.inner();

    if (this.isEmpty() || other.isEmpty()) {
      return inner === otherInner
    }

    const innerItem = inner.get();
    const otherInnerItem = otherInner.get();

    return (isSomething(innerItem) && innerItem.equals)
      ? innerItem.equals(otherInnerItem)
      : haveSameValues(innerItem, otherInnerItem)
  }

  static of (v) {
    return new Maybe(v)
  }

  static ofAny (v) {
    return new Maybe(v, false)
  }

  static metadata (itemMetadata) {
    return Object.freeze({type: Maybe, reviver: reviverFactory$2(itemMetadata)})
  }

  static innerTypes () {
    return emptyObject
  }
}

Maybe.displayName = 'Maybe';
Maybe.EMPTY = Maybe.of();

var Maybe$1 = Object.freeze(Maybe);

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

const reviverFactory$3 = enumerators => (k, v) => {
  const enumerator = enumerators[v];

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator (${v})`)
  }

  return enumerator
};

class Enum extends Base$1 {
  constructor (input) {
    const enumerators = Array.isArray(input)
      ? input.reduce(enumeratorsReducer, {})
      : input;

    super(Enum);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => {
        this[enumerator] = always(enumerators[enumerator]);
        enumerators[enumerator].toJSON = always(enumerator);
      });

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: Enum,
        reviver: reviverFactory$3(enumerators)
      })),
      enumerable: false
    });

    Object.freeze(this);
  }

  static fromObject (obj) {
    return new Enum(obj)
  }

  static fromArray (arr) {
    return new Enum(arr)
  }

  static innerTypes () {
    return emptyObject
  }
}

Enum.displayName = 'Enum';

var Enum$1 = Object.freeze(Enum);

const set = (thisArg, Type, key, value) => {
  const newMap = thisArg.inner();
  newMap.set(key, value);

  return Type.fromMap(newMap)
};

const of = (Type, args) => {
  const len = args.length;

  if (len % 2 === 1) {
    throw TypeError(`${Type.displayName || Type.name}.of requires an even number of arguments`)
  }

  const pairs = [];

  for (let i = 0; i < len; i += 2) {
    pairs.push([args[i], args[i + 1]]);
  }

  return Type.fromArray(pairs)
};

const metadata$1 = (Type, reviver) => {
  return Object.freeze({type: Type, reviver})
};

class AbstractMap extends Base$1 {
  constructor (Type, innerMapOrig) {
    super(Type);

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map')
    }

    const innerMap = new Map(innerMapOrig);

    this.inner = () => new Map(innerMap);
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();
  }

  setPath (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path;
    const item = this.inner().get(key);

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const items = [...this];
    const otherItems = [...other];

    if (items.length !== otherItems.length) {
      return false
    }

    return items.every((item, index) => {
      const otherItem = otherItems[index];

      return item.every((itemPart, index) => {
        return equals(itemPart, otherItem[index])
      })
    })
  }
}

var AbstractMap$1 = Object.freeze(AbstractMap);

const parseMapper = (keyMetadata, valueMetadata) => pair => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const revivedKey = reviveKey('', pair[0]);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const revivedVal = reviveVal('', pair[1]);

  return [revivedKey, revivedVal]
};

const reviverFactory$4 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const innerMap = (v === null)
    ? null
    : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

  return ModelicoMap.fromMap(innerMap)
};

class ModelicoMap extends AbstractMap$1 {
  constructor (innerMap) {
    super(ModelicoMap, innerMap);

    Object.freeze(this);
  }

  set (key, value) {
    return set(this, ModelicoMap, key, value)
  }

  toJSON () {
    return [...this.inner()]
  }

  static fromMap (map) {
    return new ModelicoMap(map)
  }

  static fromArray (pairs) {
    return ModelicoMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(ModelicoMap, args)
  }

  static fromObject (obj) {
    return ModelicoMap.fromArray(objToArr(obj))
  }

  static metadata (keyMetadata, valueMetadata) {
    return metadata$1(ModelicoMap, reviverFactory$4(keyMetadata, valueMetadata))
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoMap.displayName = 'ModelicoMap';
ModelicoMap.EMPTY = ModelicoMap.of();

var ModelicoMap$1 = Object.freeze(ModelicoMap);

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc
};

const parseMapper$1 = (keyMetadata, valueMetadata, object) => enumerator => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', enumerator);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', object[enumerator]);

  return [key, val]
};

const reviverFactory$5 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).map(parseMapper$1(keyMetadata, valueMetadata, v)));

  return new EnumMap(innerMap)
};

class EnumMap extends AbstractMap$1 {
  constructor (innerMap) {
    super(EnumMap, innerMap);

    Object.freeze(this);
  }

  set (enumerator, value) {
    return set(this, EnumMap, enumerator, value)
  }

  toJSON () {
    return [...this.inner()].reduce(stringifyReducer, {})
  }

  static fromMap (map) {
    return new EnumMap(map)
  }

  static fromArray (pairs) {
    return EnumMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(EnumMap, args)
  }

  static metadata (keyMetadata, valueMetadata) {
    return metadata$1(EnumMap, reviverFactory$5(keyMetadata, valueMetadata))
  }

  static innerTypes () {
    return emptyObject
  }
}

EnumMap.displayName = 'EnumMap';
EnumMap.EMPTY = EnumMap.of();

var EnumMap$1 = Object.freeze(EnumMap);

const reviver = (k, v) => {
  return ModelicoNumber.of(v)
};

class ModelicoNumber extends Base$1 {
  constructor (number) {
    super(ModelicoNumber);

    if (!Number.isNaN(number) && isNothing(number)) {
      throw TypeError('missing number')
    }

    this.inner = always(Number(number));

    Object.freeze(this);
  }

  set () {
    unsupported('Number.set is not supported');
  }

  setPath (path, number) {
    if (path.length === 0) {
      return ModelicoNumber.of(number)
    }

    unsupported('ModelicoNumber.setPath is not supported for non-empty paths');
  }

  toJSON () {
    const v = this.inner();

    return Object.is(v, -0) ? '-0'
      : (v === Infinity) ? 'Infinity'
      : (v === -Infinity) ? '-Infinity'
      : Number.isNaN(v) ? 'NaN'
      : v
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return haveSameValues(this.inner(), other.inner())
  }

  static of (number) {
    return new ModelicoNumber(number)
  }

  static metadata () {
    return Object.freeze({type: ModelicoNumber, reviver})
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoNumber.displayName = 'ModelicoNumber';

var ModelicoNumber$1 = Object.freeze(ModelicoNumber);

const reviver$1 = (k, v) => {
  const date = (v === null)
    ? null
    : new Date(v);

  return new ModelicoDate(date)
};

class ModelicoDate extends Base$1 {
  constructor (dateOrig) {
    super(ModelicoDate);

    if (isNothing(dateOrig)) {
      throw TypeError('missing date')
    }

    const date = new Date(dateOrig.getTime());

    this.inner = () => new Date(date.getTime());

    Object.freeze(this);
  }

  set () {
    unsupported('Date.set is not supported');
  }

  setPath (path, date) {
    if (path.length === 0) {
      return ModelicoDate.of(date)
    }

    unsupported('Date.setPath is not supported for non-empty paths');
  }

  toJSON () {
    return this.inner().toISOString()
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return this.toJSON() === other.toJSON()
  }

  static of (date) {
    return new ModelicoDate(date)
  }

  static metadata () {
    return Object.freeze({type: ModelicoDate, reviver: reviver$1})
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoDate.displayName = 'ModelicoDate';

var ModelicoDate$1 = Object.freeze(ModelicoDate);

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const revive = partial(reviverOrAsIs(itemMetadata), k);
  const iterable = (v === null)
    ? null
    : v.map(revive);

  return new IterableType(iterable)
};

const iterableMetadata = (IterableType, itemMetadata) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  })
};

const iterableEquals = (thisArg, other) => {
  if (thisArg === other) {
    return true
  }

  if (haveDifferentTypes(thisArg, other)) {
    return false
  }

  const items = [...thisArg];
  const otherItems = [...other];

  if (items.length !== otherItems.length) {
    return false
  }

  return items.every((item, index) => {
    return equals(item, otherItems[index])
  })
};

class List extends Base$1 {
  constructor (innerListOrig) {
    super(List);

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list')
    }

    const innerList = [...innerListOrig];

    this.inner = () => [...innerList];
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    Object.freeze(this);
  }

  set (index, value) {
    const newList = this.inner();
    newList[index] = value;

    return List.fromArray(newList)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path;
    const item = this.inner()[key];

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
  }

  toJSON () {
    return this.inner()
  }

  equals (other) {
    return iterableEquals(this, other)
  }

  static fromArray (arr) {
    return new List(arr)
  }

  static of (...arr) {
    return List.fromArray(arr)
  }

  static metadata (itemMetadata) {
    return iterableMetadata(List, itemMetadata)
  }

  static innerTypes () {
    return emptyObject
  }
}

List.displayName = 'List';
List.EMPTY = List.of();

var List$1 = Object.freeze(List);

class ModelicoSet extends Base$1 {
  constructor (innerSetOrig) {
    super(ModelicoSet);

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    const innerSet = new Set(innerSetOrig);

    this.inner = () => new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    Object.freeze(this);
  }

  set () {
    unsupported('Set.set is not supported');
  }

  setPath (path, set) {
    if (path.length === 0) {
      return new ModelicoSet(set)
    }

    unsupported('Set.setPath is not supported for non-empty paths');
  }

  toJSON () {
    return [...this.inner()]
  }

  equals (other) {
    return iterableEquals(this, other)
  }

  static fromSet (set) {
    return new ModelicoSet(set)
  }

  static fromArray (arr) {
    return ModelicoSet.fromSet(new Set(arr))
  }

  static of (...arr) {
    return ModelicoSet.fromArray(arr)
  }

  static metadata (itemMetadata) {
    return iterableMetadata(ModelicoSet, itemMetadata)
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoSet.displayName = 'ModelicoSet';
ModelicoSet.EMPTY = ModelicoSet.of();

var ModelicoSet$1 = Object.freeze(ModelicoSet);

const Any = x => identity(x);

var Any$1 = Object.freeze(Any);

const proxyToSelf = (nonMutators, mutators, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop]
  }

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, newObj)
  }
};

const proxyToInner = (inner, candidate, nonMutators, mutators, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, newObj)
    }
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, newObj)
    }
  }

  return (...args) => {
    return candidate.apply(inner, args)
  }
};

const proxyFactory = (nonMutators, mutators, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, target, prop)
    }

    const inner = target.inner();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, target, prop)
    }

    return candidate
  };

  return new Proxy(obj, {get})
};

var asIs = (Type = Any$1) =>
  Object.freeze({type: Type, reviver: asIsReviver(Type)});

const internalNonMutators = ['set', 'setPath'];

const mapNonMutators = internalNonMutators;
const mapMutators = ['set', 'delete', 'clear'];

const setNonMutators = internalNonMutators;
const setMutators = ['add', 'delete', 'clear'];

const listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
const listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

const dateNonMutators = internalNonMutators;
const dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds',
  'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth',
  'setUTCSeconds', 'setYear'];

const _ = function (Type, depth = 0, innerMetadata = []) {
  if (Type.metadata) {
    return Type.metadata(...innerMetadata)
  }

  return Object.freeze({type: Type, reviver: reviverFactory(depth, Type)})
};

const metadata = Object.freeze({
  _,
  asIs,
  any: always(asIs(Any$1)),
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber$1.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),
  regExp: always(asIs(RegExp)),
  fn: always(asIs(Function)),

  date: ModelicoDate$1.metadata,
  enumMap: EnumMap$1.metadata,
  list: List$1.metadata,
  map: ModelicoMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata
});

var M = {
  about: Object.freeze({ version, author, homepage, license }),
  Any: Any$1,
  Number: ModelicoNumber$1,
  Date: ModelicoDate$1,
  Enum: Enum$1,
  EnumMap: EnumMap$1,
  List: List$1,
  Map: ModelicoMap$1,
  Maybe: Maybe$1,
  Base: Base$1,
  Set: ModelicoSet$1,
  fields: x => x[fieldsSymbol](),
  fromJSON: (Type, json) => JSON.parse(json, _(Type).reviver),
  genericsFromJSON: (Type, innerMetadata, json) => JSON.parse(json, _(Type, 0, innerMetadata).reviver),
  metadata,
  proxyMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyEnumMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory, listNonMutators, listMutators),
  proxySet: partial(proxyFactory, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators)
};

export default M;
