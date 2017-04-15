var version = "22.1.0";






var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico#readme";

const typeSymbol = Symbol('type');
const fieldsSymbol = Symbol('fields');
const innerOrigSymbol = Symbol('innerOrig');


var symbols = Object.freeze({
	typeSymbol: typeSymbol,
	fieldsSymbol: fieldsSymbol,
	innerOrigSymbol: innerOrigSymbol
});

// @flow

const get = (field/* : string */) => (obj/* : Object */) => obj[field];
const pipe2 = (f/* : Function */, g/* : Function */) => (...args/* : Array<mixed> */) => g(f(...args));
const not = (x/* : boolean */)/* : boolean */ => !x;

const T = () => true;
const identity = /* :: <T> */(x/* : T */)/* : T */ => x;
const pipe = (...fns/* : Array<Function> */) => [...fns, identity].reduce(pipe2);
const partial = (fn/* : Function */, ...args/* : Array<mixed> */) => fn.bind(undefined, ...args);
const asIsReviver = (transform/* : Function */) => (k/* : string */, v/* : mixed */) => transform(v);
const always = /* :: <T> */(x/* : T */) => ()/* : T */ => x;
const isNothing = (v/* : mixed */)/* : boolean */ => v == null || Number.isNaN(v);
const isSomething = pipe2(isNothing, not);

const assertSomethingIdentity = /* :: <T> */(x/* : T */)/* : T */ => {
  if (isNothing(x)) {
    throw TypeError(`expected a value but got nothing (null, undefined or NaN)`)
  }

  return x
};

const defaultTo = (d/* : mixed */) => (v/* : mixed */) => isNothing(v) ? d : v;
const objToArr = (obj/* : Object */) => Object.keys(obj).map(k => [k, obj[k]]);
const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver(assertSomethingIdentity)));
const isPlainObject = (x/* : mixed */)/* : boolean */ => typeof x === 'object' && !!x;
const isFunction = (x/* : mixed */)/* : boolean */ => typeof x === 'function';
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

const unsupported = (message/* : string */) => {
  throw Error(message)
};

const innerTypesCache = new WeakMap();

const getInnerTypes = (path, Type) => {
  return Type.innerTypes(path, Type)
};

var getInnerTypes$1 = (path, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type));
  }

  return innerTypesCache.get(Type)
};

const metadataSchemaCache = new WeakMap();

let state;
const defaultState = () => ({
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set(),
  metadataRefCache: new WeakMap()
});

const getSchemaImpl = metadata => {
  if (metadata.schema) {
    return metadata.schema()
  }

  const hasInnerTypes = (metadata.type && metadata.type.innerTypes);

  const innerTypes = hasInnerTypes
    ? getInnerTypes$1([], metadata.type)
    : emptyObject;

  if (Object.keys(innerTypes).length === 0) {
    return emptyObject
  }

  const baseSchema = { type: 'object' };

  const required = [];
  const properties = Object.keys(innerTypes).reduce((acc, fieldName) => {
    const fieldMetadata = innerTypes[fieldName];
    const fieldSchema = getSchema(fieldMetadata, false);
    let schema;

    if (fieldMetadata.default === undefined) {
      required.push(fieldName);
      schema = fieldSchema;
    } else {
      schema = Object.assign({
        anyOf: [
          { type: 'null' },
          fieldSchema
        ]
      }, (fieldMetadata.type === M.Maybe) ? undefined : { default: fieldMetadata.default });
    }

    return Object.assign(acc, {[fieldName]: schema})
  }, {});

  const schema = Object.assign({}, baseSchema, { properties });

  if (required.length > 0) {
    schema.required = required;
  }

  return schema
};

const getUsedDefinitions = () => {
  const { definitions, usedDefinitions } = state;

  return Object.keys(definitions).map(Number).reduce((acc, ref) => {
    if (usedDefinitions.has(ref)) {
      acc[ref] = definitions[ref];
    }

    return acc
  }, {})
};

const getSchema = (metadata, topLevel = true) => {
  if (metadataSchemaCache.has(metadata)) {
    return metadataSchemaCache.get(metadata)
  }

  if (topLevel) {
    state = defaultState();
  }

  if (state.metadataRefCache.has(metadata)) {
    const ref = state.metadataRefCache.get(metadata);
    state.usedDefinitions.add(ref);
    return { $ref: `#/definitions/${ref}` }
  }

  const ref = state.nextRef;

  state.metadataRefCache.set(metadata, ref);
  state.nextRef += 1;

  const schema = getSchemaImpl(metadata);

  Object.assign(state.definitions, { [ref]: schema });

  if (!topLevel) {
    const ref = state.metadataRefCache.get(metadata);
    const schemaKeys = Object.keys(schema);

    if (!ref || (schemaKeys.length <= 1 && !Array.isArray(schema[schemaKeys[0]]))) {
      return schema
    }

    state.usedDefinitions.add(ref);
    return { $ref: `#/definitions/${ref}` }
  }

  const definitions = getUsedDefinitions();

  const finalSchema = (Object.keys(definitions).length === 0)
    ? schema
    : !definitions.hasOwnProperty(ref)
    ? Object.assign(schema, {definitions})
    : {
      definitions: Object.assign(definitions, { [ref]: schema }),
      $ref: `#/definitions/${ref}`
    };

  metadataSchemaCache.set(metadata, finalSchema);

  // console.log('----------------')
  // console.log(JSON.stringify(finalSchema, null, 2))

  return finalSchema
};

var validate = (instance, innerMetadata = []) => {
  try {
    M.genericsFromJSON(
      instance[M.symbols.typeSymbol](),
      innerMetadata,
      JSON.stringify(instance)
    );
  } catch (e) {
    return [false, e]
  }

  return [true, undefined]
};

const defaultErrorMsgFn = (x, path) => `Invalid value at "${path.join(' -> ')}"`;

var withValidation = (validateFn, errorMsgFn = defaultErrorMsgFn) => metadata => {
  const reviver = (k, v, path = []) => {
    if (k !== '') {
      return v
    }

    const revivedValue = metadata.reviver('', v, path);

    if (!validateFn(revivedValue)) {
      throw TypeError(errorMsgFn(revivedValue, path))
    }

    return revivedValue
  };

  return Object.assign({}, metadata, { reviver })
};

var asIs = (transformer = identity) =>
  Object.freeze({
    type: transformer,
    reviver: asIsReviver(pipe(assertSomethingIdentity, transformer)),
    maybeReviver: asIsReviver(transformer)
  });

var any = always(asIs(identity));

var anyOf = (conditionedMetas = [], enumField = 'type') => (v, path) => {
  if (conditionedMetas.length === 0) {
    return any
  }

  const Enum = conditionedMetas[0][1][typeSymbol]();
  const enumeratorToMatch = Enum.metadata().reviver('', v[enumField]);

  for (let i = 0; i < conditionedMetas.length; i += 1) {
    const conditionedMeta = conditionedMetas[i];
    const metadata = conditionedMeta[0];
    const enumerator = conditionedMeta[1];

    if (enumeratorToMatch === enumerator) {
      return metadata
    }
  }

  const prevPath = path.slice(0, -1);

  throw TypeError(`unsupported enumerator "${enumeratorToMatch.toJSON()}" at "${prevPath.join(' -> ')}"`)
};

const plainObjectReviverFactory = (Type, k, v, prevPath) =>
  Object.keys(v).reduce((acc, field) => {
    const path = prevPath.concat(field);
    const innerTypes = getInnerTypes$1(prevPath, Type);

    const metadataCandidate = innerTypes[field];
    const metadata = isFunction(metadataCandidate)
      ? metadataCandidate(v, path)
      : metadataCandidate;

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field], path);
    } else {
      acc[field] = v[field];
    }

    return acc
  }, {});

const reviverFactory = Type => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const fields = isPlainObject(v)
    ? plainObjectReviverFactory(Type, k, v, path)
    : v;

  return new Type(fields)
};

const getPathReducer = (result, part) => result.get(part);

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    // This slows down the benchmarks by a lot, but it isn't clear whether
    // real usage would benefit from removing it.
    // See: https://github.com/javiercejudo/modelico-benchmarks
    Object.freeze(fields);

    const defaults = {};
    const innerTypes = getInnerTypes$1([], Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);

    Object.keys(innerTypes).forEach(key => {
      const valueCandidate = fields[key];
      const defaultCandidate = innerTypes[key].default;
      let value;

      if (isSomething(valueCandidate)) {
        value = valueCandidate;
      } else if (isSomething(defaultCandidate)) {
        value = innerTypes[key].default;
        defaults[key] = value;
      } else {
        throw TypeError(`no value for key "${key}"`)
      }

      thisArg[key] = always(value);
    });

    thisArg[fieldsSymbol] = always(Object.freeze(Object.assign(defaults, fields)));
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoModel'
  }

  get (field) {
    return this[fieldsSymbol]()[field]
  }

  getIn (path) {
    return path.reduce(getPathReducer, this)
  }

  copy (fields) {
    const newFields = Object.assign({}, this[fieldsSymbol](), fields);

    return new (this[typeSymbol]())(newFields)
  }

  set (field, value) {
    return this.copy({[field]: value})
  }

  setIn (path, value) {
    if (path.length === 0) {
      return this.copy(value)
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

  static innerTypes () {
    return emptyObject
  }

  static factory (...args) {
    return new Base(...args)
  }
}

var Base$1 = Object.freeze(Base);

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
  }

  [Symbol.iterator] () {
    return this[innerOrigSymbol]()[Symbol.iterator]()
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

const parseMapper = (keyReviver, valueReviver, path) => (pair, i) => [
  keyReviver('', pair[0], path.concat(i, 0)),
  valueReviver('', pair[1], path.concat(i, 1))
];

const reviverFactory$2 = (keyMetadata, valueMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(isFunction(keyMetadata) ? keyMetadata(v, path) : keyMetadata);
  const valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(v.map(parseMapper(keyReviver, valueReviver, path)));

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

  get [Symbol.toStringTag] () {
    return 'ModelicoMap'
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
    return metadata$1(ModelicoMap, reviverFactory$2, keyMetadata, valueMetadata)
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

const parseReducer = (valueReviver, obj, path) => (acc, key) =>
  [...acc, [key, valueReviver('', obj[key], path.concat(key))]];

const reviverFactory$3 = valueMetadata => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).reduce(parseReducer(valueReviver, v, path), []));

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

  get [Symbol.toStringTag] () {
    return 'ModelicoStringMap'
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
    return metadata$1(StringMap, reviverFactory$3, valueMetadata)
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

const parseMapper$1 = (keyReviver, valueReviver, obj, path) => enumerator => {
  const key = keyReviver('', enumerator, path);
  const val = valueReviver('', obj[enumerator], path.concat(enumerator));

  return [key, val]
};

const reviverFactory$4 = (keyMetadata, valueMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(isFunction(keyMetadata) ? keyMetadata(v, path) : keyMetadata);
  const valueReviver = reviverOrAsIs(isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata);

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).map(parseMapper$1(keyReviver, valueReviver, v, path)));

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

  get [Symbol.toStringTag] () {
    return 'ModelicoEnumMap'
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
    return metadata$1(EnumMap, reviverFactory$4, keyMetadata, valueMetadata)
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

  get [Symbol.toStringTag] () {
    return 'ModelicoNumber'
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

  get [Symbol.toStringTag] () {
    return 'ModelicoDate'
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
}

ModelicoDate.displayName = 'ModelicoDate';

var ModelicoDate$1 = Object.freeze(ModelicoDate);

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const isTuple = Array.isArray(itemMetadata);

  if (isTuple && v.length !== itemMetadata.length) {
    throw TypeError('tuple has missing or extra items')
  }

  const itemMetadataGetter = isTuple
    ? i => isFunction(itemMetadata[i]) ? itemMetadata[i](v, path) : itemMetadata[i]
    : isFunction(itemMetadata) ? always(itemMetadata(v, path)) : always(itemMetadata);

  const revive = (x, i) => reviverOrAsIs(itemMetadataGetter(i))('', x, path.concat(i));

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
    this[innerOrigSymbol] = this.inner;
    this.size = innerList.length;

    if (!EMPTY_LIST && this.size === 0) {
      EMPTY_LIST = this;
    }

    Object.freeze(this);
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoList'
  }

  [Symbol.iterator] () {
    return this.inner()[Symbol.iterator]()
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

    if (!EMPTY_SET && this.size === 0) {
      EMPTY_SET = this;
    }

    Object.freeze(this);
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoSet'
  }

  [Symbol.iterator] () {
    return this.inner()[Symbol.iterator]()
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

  static EMPTY () {
    return EMPTY_SET || ModelicoSet.of()
  }
}

ModelicoSet.displayName = 'ModelicoSet';

var ModelicoSet$1 = Object.freeze(ModelicoSet);

const reviverFactory$5 = itemMetadata => (k, v, path) => {
  if (k !== '') {
    return v
  }

  const metadata = isFunction(itemMetadata)
    ? itemMetadata(v, path)
    : itemMetadata;

  const revive = (v === null)
    ? always(null)
    : defaultTo(metadata.reviver)(metadata.maybeReviver);

  const revivedValue = revive(k, v, path);

  return Maybe.of(revivedValue)
};

class Maybe extends Base$1 {
  constructor () {
    super(Maybe);
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

    const item = this.inner();

    if (isNothing(item)) {
      return this
    }

    const newItem = (item.set)
      ? item.set(field, v)
      : null;

    return Maybe.of(newItem)
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
      : this.inner();

    const inner = (item.setIn)
      ? item.setIn([field, ...restPath], v)
      : null;

    return Maybe.of(inner)
  }

  static of (v) {
    return isNothing(v)
      ? new Nothing()
      : new Just(v)
  }

  static metadata (itemMetadata) {
    return Object.freeze({
      type: Maybe,
      subtypes: [itemMetadata],
      reviver: reviverFactory$5(itemMetadata),
      default: new Nothing()
    })
  }
}

Maybe.displayName = 'Maybe';

let nothing;

class Nothing extends Maybe {
  constructor () {
    super();

    if (!nothing) {
      this.inner = always(TypeError('nothing holds no value'));
      nothing = this;
    }

    return nothing
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoNothing'
  }

  toJSON () {
    return null
  }

  isEmpty () {
    return true
  }

  getOrElse (v) {
    return v
  }

  map () {
    return this
  }

  equals (other) {
    return (this === other)
  }
}

class Just extends Maybe {
  constructor (v) {
    super();

    this.inner = always(v);

    Object.freeze(this);
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoJust'
  }

  toJSON () {
    const v = this.inner();

    if (isNothing(v)) {
      return null
    }

    return (v.toJSON)
      ? v.toJSON()
      : v
  }

  isEmpty () {
    return false
  }

  getOrElse (v) {
    return this.inner()
  }

  map (f) {
    return Just.of(f(this.inner()))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return equals(this.inner(), other.inner())
  }

  static of (v) {
    return new Just(v)
  }
}

Just.displayName = 'Just';

Maybe.Nothing = new Nothing();
Maybe.Just = Just;

var Maybe$1 = Object.freeze(Maybe);

const metadataCache = new WeakMap();

const base = Type =>
  Object.freeze({type: Type, reviver: reviverFactory(Type)});

const raw_ = (Type, innerMetadata) =>
  Type.metadata
    ? Type.metadata(...innerMetadata)
    : base(Type);

const _$1 = (Type, metadata = []) => {
  if (metadata.length > 0) {
    return raw_(Type, metadata)
  }

  if (!metadataCache.has(Type)) {
    metadataCache.set(Type, raw_(Type, metadata));
  }

  return metadataCache.get(Type)
};

const metadata = () => Object.freeze({
  _: _$1,
  base,
  asIs,
  any,
  anyOf,
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber$1.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),

  date: ModelicoDate$1.metadata,
  enumMap: EnumMap$1.metadata,
  list: List$1.metadata,
  map: ModelicoMap$1.metadata,
  stringMap: StringMap$1.metadata,
  maybe: Maybe$1.metadata,
  set: ModelicoSet$1.metadata,

  withDefault: (metadata, def) => {
    const defaultValue = reviverOrAsIs(metadata)('', def);

    return Object.freeze(Object.assign({}, metadata, { default: defaultValue }))
  }
});

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

const reviverFactory$6 = enumerators => (k, v, path = []) => {
  const enumerator = enumerators[v];

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator "${v}" at "${path.join(' -> ')}"`)
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
        enumerators[enumerator][typeSymbol] = always(this);
        enumerators[enumerator].toJSON = always(enumerator);
        enumerators[enumerator].equals = other => (enumerators[enumerator] === other);
      });

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: Ctor,
        enumerators,
        reviver: reviverFactory$6(enumerators)
      }))
    });
  }

  static fromObject (...args) {
    return new Enum(...args)
  }

  static fromArray (...args) {
    return new Enum(...args)
  }
}

Object.defineProperty(Enum, 'displayName', {
  value: 'Enum',
  writable: true
});

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

const formatError = (ajv, schema, value, path = []) => [
  'Invalid JSON at "' + path.join(' -> ') + '". According to the schema\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the value (data path "' + ajv.errors.filter(e => e.dataPath !== '').map(error => error.dataPath) + '")\n',
  JSON.stringify(value, null, 2) + '\n'
].concat(ajv.errors.map(error => error.message)).join('\n');

const formatDefaultValueError = (ajv, schema, value) => [
  'Invalid default value. According to the schema\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the default value\n',
  JSON.stringify(value, null, 2) + '\n'
].concat(ajv.errors.map(error => error.message)).join('\n');

var ajvMetadata = (ajv = { validate: T }) => {
  const metadata = M.metadata();
  const ajvMetadata = {};

  const {
    _,
    base,
    asIs,
    any,
    anyOf,
    string,
    number,
    boolean,
    date,
    enumMap,
    list,
    map,
    stringMap,
    set,
    maybe,
    withDefault
  } = metadata;

  const ensure = (metadata, schema, valueTransformer = identity) => (k, value, path) => {
    if (k !== '') {
      return value
    }

    const valid = (schema === emptyObject)
      ? true
      : ajv.validate(schema, valueTransformer(value));

    if (!valid) {
      throw TypeError(formatError(ajv, schema, value, path))
    }

    const resolvedMetadata = isFunction(metadata)
      ? metadata(value, path)
      : metadata;

    return resolvedMetadata.reviver('', value, path)
  };

  const ensureWrapped = (metadata, schema1, schema2) => (k, value) => {
    if (k !== '') {
      return value
    }

    const unwrappedValue = ensure(metadata, schema1)(k, value);

    return ensure(any(), schema2, x => x.inner())(k, unwrappedValue)
  };

  const ajvMeta = (metadata, baseSchema, mainSchema = emptyObject, innerSchemaGetter = always(emptyObject)) => {
    const schemaToCheck = (baseSchema === emptyObject && mainSchema === emptyObject)
      ? emptyObject
      : Object.assign({}, baseSchema, mainSchema);

    const reviver = ensure(metadata, schemaToCheck);

    const schemaGetter = () => Object.assign({}, schemaToCheck, innerSchemaGetter());

    const baseMetadata = isFunction(metadata)
      ? { type: metadata }
      : metadata;

    return Object.assign({}, baseMetadata, { reviver, ownSchema: always(schemaToCheck), schema: schemaGetter })
  };

  ajvMetadata.ajvMeta = ajvMeta;

  ajvMetadata.ajv_ = (Type, schema = emptyObject, innerMetadata) => {
    const metadata = _(Type, innerMetadata);

    return ajvMeta(metadata, emptyObject, schema, () => getSchema(metadata, false))
  };

  ajvMetadata.ajvBase = (Type, schema = emptyObject) => {
    const metadata = base(Type);

    return ajvMeta(metadata, { type: 'object' }, schema, () => getSchema(metadata, false))
  };

  ajvMetadata.ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema);

  ajvMetadata.ajvAny = schema => ajvMetadata.ajvAsIs(schema);

  ajvMetadata.ajvNumber = (schema, options = emptyObject) => {
    const { wrap = false } = options;
    const metadata = number(options);

    if (!wrap) {
      return ajvMeta(metadata, { type: 'number' }, schema)
    }

    const numberMeta = Object.assign({ type: 'number' }, schema);

    const reviver = ensureWrapped(metadata, {
      anyOf: [
        { type: 'number' },
        { enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }
      ]
    }, numberMeta);

    return Object.assign({}, metadata, { reviver, ownSchema: always(numberMeta), schema: always(numberMeta) })
  };

  ajvMetadata.ajvString = schema =>
    ajvMeta(string(), { type: 'string' }, schema);

  ajvMetadata.ajvBoolean = schema =>
    ajvMeta(boolean(), { type: 'boolean' }, schema);

  ajvMetadata.ajvDate = schema =>
    ajvMeta(date(), { type: 'string', format: 'date-time' }, schema);

  ajvMetadata.ajvEnum = Type => {
    const metadata = _(Type);

    return ajvMeta(metadata, {enum: Object.keys(metadata.enumerators)})
  };

  ajvMetadata.ajvEnumMap = (schema, keyMetadata, valueMetadata) => {
    const enumeratorsKeys = Object.keys(keyMetadata.enumerators);
    const keysRegex = `^(${enumeratorsKeys.join('|')})$`;

    return ajvMeta(
      enumMap(keyMetadata, valueMetadata), {
        type: 'object',
        maxProperties: enumeratorsKeys.length,
        additionalProperties: false,
        patternProperties: {
          [keysRegex]: {}
        }
      },
      schema,
      () => ({
        patternProperties: {
          [keysRegex]: getSchema(valueMetadata, false)
        }
      })
    )
  };

  const ajvList = (schema, itemMetadata) =>
    ajvMeta(
      list(itemMetadata),
      { type: 'array' },
      schema,
      () => ({ items: getSchema(itemMetadata, false) })
    );

  const ajvTuple = (schema, itemsMetadata) => {
    const length = itemsMetadata.length;

    return ajvMeta(
      list(itemsMetadata),
      {
        type: 'array',
        minItems: length,
        maxItems: length
      },
      schema,
      () => ({ items: itemsMetadata.map(itemMetadata => getSchema(itemMetadata, false)) })
    )
  };

  ajvMetadata.ajvList = (schema, itemMetadata) => Array.isArray(itemMetadata)
    ? ajvTuple(schema, itemMetadata)
    : ajvList(schema, itemMetadata);

  ajvMetadata.ajvMap = (schema, keyMetadata, valueMetadata) => {
    const baseSchema = {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    };

    const keyValueSchemaGetter = () => ({
      items: Object.assign({
        items: [
          getSchema(keyMetadata, false),
          getSchema(valueMetadata, false)
        ]
      }, baseSchema.items)
    });

    return ajvMeta(map(keyMetadata, valueMetadata), baseSchema, schema, keyValueSchemaGetter)
  };

  ajvMetadata.ajvStringMap = (schema, valueMetadata) =>
    ajvMeta(
      stringMap(valueMetadata),
      { type: 'object' },
      schema,
      () => ({
        additionalProperties: false,
        patternProperties: { '.*': getSchema(valueMetadata, false) }
      })
    );

  ajvMetadata.ajvSet = (schema, itemMetadata) =>
    ajvMeta(set(itemMetadata), {
      type: 'array',
      uniqueItems: true
    }, schema, () => ({ items: getSchema(itemMetadata, false) }));

  ajvMetadata.ajvMaybe = (itemMetadata) =>
    ajvMeta(maybe(itemMetadata), emptyObject, emptyObject, () => getSchema(itemMetadata, false));

  ajvMetadata.ajvWithDefault = (metadata, defaultValue) => {
    const schema = getSchema(metadata);
    const valid = ajv.validate(schema, defaultValue);

    if (!valid) {
      throw TypeError(formatDefaultValueError(ajv, schema, defaultValue))
    }

    return ajvMeta(withDefault(metadata, defaultValue), {
      default: defaultValue
    }, emptyObject, always(schema))
  };

  ajvMetadata.ajvAnyOf = (conditionedMetas, enumField) =>
    ajvMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(conditionMeta => getSchema(conditionMeta[0], false))
    });

  return Object.freeze(Object.assign(ajvMetadata, metadata))
};

const metadata$2 = metadata();

const createModel = (
  innerTypes = emptyObject,
  {
    base = Base$1,
    stringTag = 'ModelicoModel',
    metadata: m = metadata$2
  } = {}
) => {
  return class extends base {
    get [Symbol.toStringTag] () {
      return stringTag
    }

    static innerTypes (path, Type) {
      return isFunction(innerTypes)
        ? innerTypes(m, {path, Type})
        : Object.freeze(innerTypes)
    }
  }
};

const { _ } = metadata();

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

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity);
const genericsFromJS = (Type, innerMetadata, js) => _(Type, innerMetadata).reviver('', js);
const fromJS = (Type, js) => genericsFromJS(Type, [], js);
const ajvGenericsFromJS = (_, Type, schema, innerMetadata, js) => _(Type, schema, innerMetadata).reviver('', js);
const ajvFromJS = (_, Type, schema, js) => ajvGenericsFromJS(_, Type, schema, [], js);

const createAjvModel = (ajv, innerTypes, options = {}) => {
  options.metadata = ajvMetadata(ajv);

  return createModel(innerTypes, options)
};

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
  Just: Maybe$1.Just,
  Nothing: Maybe$1.Nothing,
  Base: Base$1,
  Set: ModelicoSet$1,
  createModel,
  createAjvModel,
  fields: x => x[fieldsSymbol](),
  symbols,
  fromJS,
  genericsFromJS,
  fromJSON: (Type, json) => fromJS(Type, JSON.parse(json)),
  genericsFromJSON: (Type, innerMetadata, json) => genericsFromJS(Type, innerMetadata, JSON.parse(json)),
  ajvFromJS,
  ajvGenericsFromJS,
  ajvFromJSON: (_, Type, schema, json) => ajvFromJS(_, Type, schema, JSON.parse(json)),
  ajvGenericsFromJSON: (_, Type, schema, innerMetadata, json) => ajvGenericsFromJS(_, Type, schema, innerMetadata, JSON.parse(json)),
  metadata,
  ajvMetadata,
  getSchema,
  validate,
  withValidation,
  proxyMap,
  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, x => [...x]),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
};

export default M;
