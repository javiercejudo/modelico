var version = "20.0.0";





var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

const typeSymbol = Symbol('type');
const fieldsSymbol = Symbol('fields');
const innerOrigSymbol = Symbol('innerOrigSymbol');


var symbols = Object.freeze({
	typeSymbol: typeSymbol,
	fieldsSymbol: fieldsSymbol,
	innerOrigSymbol: innerOrigSymbol
});

// @flow

const get = (field/* : string */) => (obj/* : Object */) => obj[field];
const pipe2 = (fn1/* : Function */, fn2/* : Function */) => (...args/* : Array<mixed> */) => fn2(fn1(...args));
const not = (x/* : boolean */)/* : boolean */ => !x;

const T = () => true;
const identity = /* :: <T> */(x/* : T */)/* : T */ => x;

const partial = (fn/* : Function */, ...args/* : Array<mixed> */) => fn.bind(undefined, ...args);
const asIsReviver = (transform/* : Function */) => (k/* : string */, v/* : mixed */) => transform(v);
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

const getPathReducer = (result, part) => result.get(part);

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    Object.freeze(fields);

    const emptyMaybes = {};
    const innerTypes = getInnerTypes(0, Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);

    Object.keys(innerTypes).forEach(key => {
      const valueCandidate = fields[key];
      let value = M.Maybe.EMPTY;

      if (isSomething(valueCandidate)) {
        value = valueCandidate;
      } else if (innerTypes[key].type !== M.Maybe) {
        throw TypeError(`no value for key "${key}"`)
      } else {
        emptyMaybes[key] = value;
      }

      thisArg[key] = always(value);
    });

    thisArg[fieldsSymbol] = always(Object.freeze(Object.assign(emptyMaybes, fields)));
  }

  get (field) {
    return this[field]()
  }

  getIn (path) {
    return path.reduce(getPathReducer, this)
  }

  set (field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value});

    return new (this[typeSymbol]())(newFields)
  }

  setIn (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path;
    const item = this[key]();

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const thisFields = this[fieldsSymbol]();
    const otherFields = other[fieldsSymbol]();

    const thisKeys = Object.keys(thisFields);
    const otherKeys = Object.keys(otherFields);

    if (thisKeys.length !== otherKeys.length) {
      return false
    }

    return thisKeys.every(key => equals(thisFields[key], otherFields[key]))
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

  get (fieldOrFallbackPair) {
    const fallback = fieldOrFallbackPair[0];
    const field = fieldOrFallbackPair[1];
    const item = this.getOrElse(fallback);

    return item.get
      ? item.get(field)
      : item
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

  setIn (path, v) {
    if (path.length === 0) {
      return Maybe.of(v)
    }

    const [fallbackOrFieldPair, ...restPath] = path;
    const fallback = fallbackOrFieldPair[0];
    const field = fallbackOrFieldPair[1];

    const item = this.isEmpty()
      ? fallback
      : this.inner().get();

    const inner = (item.setIn)
      ? item.setIn([field, ...restPath], v)
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

    return equals(inner.get(), otherInner.get())
  }

  static of (v) {
    return new Maybe(v)
  }

  static ofAny (v) {
    return new Maybe(v, false)
  }

  static metadata (itemMetadata) {
    return Object.freeze({
      type: Maybe,
      subtypes: [itemMetadata],
      reviver: reviverFactory$2(itemMetadata)
    })
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
  constructor (input, Ctor = Enum, displayName = Ctor.displayName) {
    const enumerators = Array.isArray(input)
      ? input.reduce(enumeratorsReducer, {})
      : input;

    if (Ctor !== Enum) {
      Ctor.displayName = displayName;
      Object.freeze(Ctor);
    }

    super(Ctor);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => {
        this[enumerator] = always(enumerators[enumerator]);
        enumerators[enumerator].toJSON = always(enumerator);
        enumerators[enumerator].equals = other => (enumerators[enumerator] === other);
      });

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: Ctor,
        reviver: reviverFactory$3(enumerators)
      }))
    });
  }

  static fromObject (...args) {
    return new Enum(...args)
  }

  static fromArray (...args) {
    return new Enum(...args)
  }

  static innerTypes () {
    return emptyObject
  }
}

Object.defineProperty(Enum, 'displayName', {
  value: 'Enum',
  writable: true
});

const set = (thisArg, Type, key, value) => {
  const newMap = thisArg.inner();
  newMap.set(key, value);

  return Type.fromMap(newMap)
};

const of = (Type, args) => {
  const len = args.length;

  if (len % 2 === 1) {
    throw TypeError(`${Type.displayName}.of requires an even number of arguments`)
  }

  const map = new Map();

  for (let i = 0; i < len; i += 2) {
    map.set(args[i], args[i + 1]);
  }

  return Type.fromMap(map)
};

const metadata$1 = (Type, reviverFactory, keyMetadata, valueMetadata) => {
  return Object.freeze({
    type: Type,
    subtypes: Object.freeze([keyMetadata, valueMetadata]),
    reviver: reviverFactory(keyMetadata, valueMetadata)
  })
};

const equalPairs = (pairA, pairB) =>
  pairA.every((pairPart, index) => equals(pairPart, pairB[index]));

const copy = map => new Map(map);

class AbstractMap extends Base$1 {
  constructor (Type, innerMapOrig = new Map(), EMPTY) {
    super(Type);

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map')
    }

    if (EMPTY && innerMapOrig.size === 0) {
      return EMPTY
    }

    const innerMap = copy(innerMapOrig);

    this[innerOrigSymbol] = always(innerMap);
    this.inner = () => copy(innerMap);
    this.size = innerMap.size;
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();
  }

  has (key) {
    return this[innerOrigSymbol]().has(key)
  }

  get (key) {
    return this[innerOrigSymbol]().get(key)
  }

  setIn (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path;
    const item = this[innerOrigSymbol]().get(key);

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  equals (other, asUnordered = false) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other) || this.size !== other.size) {
      return false
    }

    const thisIter = this[Symbol.iterator]();
    const otherIter = other[Symbol.iterator]();

    for (let i = 0; i < this.size; i += 1) {
      const pair = thisIter.next().value;

      const areEqual = asUnordered
        ? other.has(pair[0]) && equals(pair[1], other.get(pair[0]))
        : equalPairs(pair, otherIter.next().value);

      if (!areEqual) {
        return false
      }
    }

    return true
  }
}

var AbstractMap$1 = Object.freeze(AbstractMap);

const parseMapper = (keyReviver, valueReviver) => pair => [
  keyReviver('', pair[0]),
  valueReviver('', pair[1])
];

const reviverFactory$4 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(keyMetadata);
  const valueReviver = reviverOrAsIs(valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(v.map(parseMapper(keyReviver, valueReviver)));

  return ModelicoMap.fromMap(innerMap)
};

let EMPTY_MAP;

class ModelicoMap extends AbstractMap$1 {
  constructor (innerMap) {
    super(ModelicoMap, innerMap, EMPTY_MAP);

    if (!EMPTY_MAP && this.size === 0) {
      EMPTY_MAP = this;
    }

    Object.freeze(this);
  }

  set (key, value) {
    return set(this, ModelicoMap, key, value)
  }

  toJSON () {
    return [...this]
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
    return metadata$1(ModelicoMap, reviverFactory$4, keyMetadata, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_MAP || ModelicoMap.of()
  }
}

ModelicoMap.displayName = 'ModelicoMap';

var ModelicoMap$1 = Object.freeze(ModelicoMap);

const stringifyReducer = (acc, pair) => {
  acc[pair[0]] = pair[1];

  return acc
};

const parseReducer = (valueReviver, obj) => (acc, key) =>
  [...acc, [key, valueReviver('', obj[key])]];

const reviverFactory$5 = valueMetadata => (k, v) => {
  if (k !== '') {
    return v
  }

  const valueReviver = reviverOrAsIs(valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).reduce(parseReducer(valueReviver, v), []));

  return StringMap.fromMap(innerMap)
};

let EMPTY_STRING_MAP;

class StringMap extends AbstractMap$1 {
  constructor (innerMap) {
    super(StringMap, innerMap, EMPTY_STRING_MAP);

    if (!EMPTY_STRING_MAP && this.size === 0) {
      EMPTY_STRING_MAP = this;
    }

    Object.freeze(this);
  }

  set (key, value) {
    return set(this, StringMap, key, value)
  }

  toJSON () {
    return [...this].reduce(stringifyReducer, {})
  }

  static fromMap (map) {
    return new StringMap(map)
  }

  static fromArray (pairs) {
    return StringMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(StringMap, args)
  }

  static fromObject (obj) {
    return StringMap.fromArray(objToArr(obj))
  }

  static metadata (valueMetadata) {
    return metadata$1(StringMap, reviverFactory$5, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_STRING_MAP || StringMap.of()
  }
}

StringMap.displayName = 'StringMap';

var StringMap$1 = Object.freeze(StringMap);

const stringifyReducer$1 = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc
};

const parseMapper$1 = (keyReviver, valueReviver, obj) => enumerator => {
  const key = keyReviver('', enumerator);
  const val = valueReviver('', obj[enumerator]);

  return [key, val]
};

const reviverFactory$6 = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(keyMetadata);
  const valueReviver = reviverOrAsIs(valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).map(parseMapper$1(keyReviver, valueReviver, v)));

  return new EnumMap(innerMap)
};

let EMPTY_ENUM_MAP;

class EnumMap extends AbstractMap$1 {
  constructor (innerMap) {
    super(EnumMap, innerMap, EMPTY_ENUM_MAP);

    if (!EMPTY_ENUM_MAP && this.size === 0) {
      EMPTY_ENUM_MAP = this;
    }

    Object.freeze(this);
  }

  set (enumerator, value) {
    return set(this, EnumMap, enumerator, value)
  }

  toJSON () {
    return [...this].reduce(stringifyReducer$1, {})
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
    return metadata$1(EnumMap, reviverFactory$6, keyMetadata, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_ENUM_MAP || EnumMap.of()
  }
}

EnumMap.displayName = 'EnumMap';

var EnumMap$1 = Object.freeze(EnumMap);

const reviver = (k, v) => {
  return ModelicoNumber.of(v)
};

class ModelicoNumber extends Base$1 {
  constructor (number = 0) {
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

  setIn (path, number) {
    if (path.length === 0) {
      return ModelicoNumber.of(number)
    }

    unsupported('ModelicoNumber.setIn is not supported for non-empty paths');
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
    return Object.freeze({
      type: ModelicoNumber,
      reviver
    })
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
  constructor (dateOrig = new Date()) {
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

  setIn (path, date) {
    if (path.length === 0) {
      return ModelicoDate.of(date)
    }

    unsupported('Date.setIn is not supported for non-empty paths');
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
    return Object.freeze({
      type: ModelicoDate,
      reviver: reviver$1
    })
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
    subtypes: Object.freeze([itemMetadata]),
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  })
};

const iterableEquals = (thisArg, other, asUnordered = false) => {
  if (thisArg === other) {
    return true
  }

  if (haveDifferentTypes(thisArg, other) || thisArg.size !== other.size) {
    return false
  }

  const thisIter = thisArg[Symbol.iterator]();
  const otherIter = other[Symbol.iterator]();

  for (let i = 0; i < thisArg.size; i += 1) {
    const item = thisIter.next().value;

    if (asUnordered) {
      if (!other.has(item)) {
        return false
      }
    } else if (!equals(item, otherIter.next().value)) {
      return false
    }
  }

  return true
};

let EMPTY_LIST;

class List extends Base$1 {
  constructor (innerList = []) {
    super(List);

    if (isNothing(innerList)) {
      throw TypeError('missing list')
    }

    if (EMPTY_LIST && innerList.length === 0) {
      return EMPTY_LIST
    }

    Object.freeze(innerList);

    this.inner = always(innerList);
    this.size = innerList.length;
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    if (!EMPTY_LIST && this.size === 0) {
      EMPTY_LIST = this;
    }

    Object.freeze(this);
  }

  includes (...args) {
    return this.inner().includes(...args)
  }

  get (index) {
    return this.inner()[index]
  }

  set (index, value) {
    const newList = [...this];
    newList[index] = value;

    return List.fromArray(newList)
  }

  setIn (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path;
    const item = this.inner()[key];

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
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

  static EMPTY () {
    return EMPTY_LIST || List.of()
  }
}

List.displayName = 'List';

var List$1 = Object.freeze(List);

let EMPTY_SET;

const copy$1 = set => new Set(set);

class ModelicoSet extends Base$1 {
  constructor (innerSetOrig = new Set()) {
    super(ModelicoSet);

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    if (EMPTY_SET && innerSetOrig.size === 0) {
      return EMPTY_SET
    }

    const innerSet = copy$1(innerSetOrig);

    this[innerOrigSymbol] = always(innerSet);
    this.inner = () => copy$1(innerSet);
    this.size = innerSet.size;
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    if (!EMPTY_SET && this.size === 0) {
      EMPTY_SET = this;
    }

    Object.freeze(this);
  }

  has (key) {
    return this[innerOrigSymbol]().has(key)
  }

  set () {
    unsupported('Set.set is not supported');
  }

  setIn (path, set) {
    if (path.length === 0) {
      return new ModelicoSet(set)
    }

    unsupported('Set.setIn is not supported for non-empty paths');
  }

  toJSON () {
    return [...this]
  }

  equals (...args) {
    return iterableEquals(this, ...args)
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

  static EMPTY () {
    return EMPTY_SET || ModelicoSet.of()
  }
}

ModelicoSet.displayName = 'ModelicoSet';

var ModelicoSet$1 = Object.freeze(ModelicoSet);

const proxyToSelf = (nonMutators, mutators, innerCloner, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop]
  }

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, innerCloner, newObj)
  }
};

const proxyToInner = (inner, candidate, nonMutators, mutators, innerCloner, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setIn([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, innerCloner, newObj)
    }
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setIn([], inner);

      return proxyFactory(nonMutators, mutators, innerCloner, newObj)
    }
  }

  return (...args) => {
    return candidate.apply(inner, args)
  }
};

const proxyFactory = (nonMutators, mutators, innerCloner, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, innerCloner, target, prop)
    }

    const inner = innerCloner(target.inner());
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, innerCloner, target, prop)
    }

    return candidate
  };

  return new Proxy(obj, {get})
};

const formatError = (ajv, schema, value) => [
  'Invalid JSON: according to the schema' + '\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the value\n',
  JSON.stringify(value, null, 2) + '\n',
  ajv.errors[0].message
].join('\n');

var ajvMetadata = (ajv = { validate: T }) => {
  const {
    _,
    asIs,
    any,
    string,
    number,
    boolean,
    date,
    enumMap,
    list,
    map,
    stringMap,
    set,
    maybe
  } = M.metadata();

  const ensure = (metadata, schema, valueTransformer = identity) => (k, value) => {
    if (k !== '') {
      return value
    }

    const valid = ajv.validate(schema, valueTransformer(value));

    if (!valid) {
      throw TypeError(formatError(ajv, schema, value))
    }

    return metadata.reviver('', value)
  };

  const ensureWrapped = (metadata, schema1, schema2) => (k, value) => {
    if (k !== '') {
      return value
    }

    const unwrappedValue = ensure(metadata, schema1)(k, value);

    return ensure(any(), schema2, x => x.inner())(k, unwrappedValue)
  };

  const ajvMeta = (meta, baseSchema, mainSchema = {}) => {
    const schema = Object.assign({}, baseSchema, mainSchema);
    const reviver = ensure(meta, schema);

    return Object.assign({}, meta, { reviver })
  };

  const ajv_ = (Type, schema) =>
    ajvMeta(_(Type), schema);

  const ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema);

  const ajvAny = schema => ajvAsIs(schema);

  const ajvNumber = (schema, options = {}) => {
    const { wrap = false } = options;
    const meta = number(options);

    if (!wrap) {
      return ajvMeta(meta, { type: 'number' }, schema)
    }

    const reviver = ensureWrapped(meta, {
      anyOf: [
        { type: 'number' },
        { type: 'string', enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }
      ]
    }, Object.assign({}, { type: 'number' }, schema));

    return Object.assign({}, meta, { reviver })
  };

  const ajvString = schema =>
    ajvMeta(string(), { type: 'string' }, schema);

  const ajvBoolean = schema =>
    ajvMeta(boolean(), { type: 'boolean' }, schema);

  const ajvDate = schema =>
    ajvMeta(date(), { type: 'string', format: 'date-time' }, schema);

  const ajvEnumMap = (schema, keyMetadata, valueMetadata) =>
    ajvMeta(enumMap(keyMetadata, valueMetadata), {
      type: 'object',
      maxProperties: Object.keys(keyMetadata).length
    }, schema);

  const ajvList = (schema, itemMetadata) =>
    ajvMeta(list(itemMetadata), { type: 'array' }, schema);

  const ajvMap = (schema, keyMetadata, valueMetadata) =>
    ajvMeta(map(keyMetadata, valueMetadata), {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    }, schema);

  const ajvStringMap = (schema, valueMetadata) =>
    ajvMeta(stringMap(valueMetadata), { type: 'object' }, schema);

  const ajvSet = (schema, itemMetadata) =>
    ajvMeta(set(itemMetadata), { type: 'array', uniqueItems: true }, schema);

  return Object.freeze({
    _: ajv_,
    asIs: ajvAsIs,
    any: ajvAny,
    number: ajvNumber,
    string: ajvString,
    boolean: ajvBoolean,
    date: ajvDate,
    enumMap: ajvEnumMap,
    list: ajvList,
    map: ajvMap,
    stringMap: ajvStringMap,
    set: ajvSet,
    maybe
  })
};

var asIs = (tranformer = identity) =>
  Object.freeze({ type: tranformer, reviver: asIsReviver(tranformer) });

const internalNonMutators = ['set', 'setIn'];

const mapNonMutators = internalNonMutators;
const mapMutators = ['delete', 'clear'];

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

const metadata = () => Object.freeze({
  _,
  asIs,
  any: always(asIs(identity)),
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber$1.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),

  date: ModelicoDate$1.metadata,
  enumMap: EnumMap$1.metadata,
  list: List$1.metadata,
  map: ModelicoMap$1.metadata,
  stringMap: StringMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata
});

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity);

var M = {
  about: Object.freeze({ version, author, homepage, license }),
  Number: ModelicoNumber$1,
  Date: ModelicoDate$1,
  Enum,
  EnumMap: EnumMap$1,
  List: List$1,
  Map: ModelicoMap$1,
  StringMap: StringMap$1,
  Maybe: Maybe$1,
  Base: Base$1,
  Set: ModelicoSet$1,
  fields: x => x[fieldsSymbol](),
  symbols,
  fromJSON: (Type, json) => JSON.parse(json, _(Type).reviver),
  fromJS: (Type, js) => _(Type).reviver('', js),
  genericsFromJSON: (Type, innerMetadata, json) => JSON.parse(json, _(Type, 0, innerMetadata).reviver),
  genericsFromJS: (Type, innerMetadata, js) => _(Type, 0, innerMetadata).reviver('', js),
  metadata,
  ajvMetadata,
  proxyMap,
  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, x => [...x]),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
};

export default M;
