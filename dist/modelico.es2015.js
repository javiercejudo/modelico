import Immutable from 'immutable';

var version = "19.0.5";






var author = "Javier Cejudo <javier@javiercejudo.com> (http://www.javiercejudo.com)";
var license = "MIT";

var homepage = "https://github.com/javiercejudo/modelico/tree/immutable-js#readme";

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

const getInnerTypes = (path/* : Array<any> */, Type/* : Function */) => {
  if (!Type.innerTypes) {
    throw Error(`missing static innerTypes for ${Type.displayName || Type.name}`)
  }

  return Type.innerTypes(path, Type)
};

var getInnerTypes$1 = (path, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type));
  }

  return innerTypesCache.get(Type)
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

const metadataSchemaCache = new WeakMap();
const metadataRefCache = new WeakMap();

const state = {
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set()
};

const getSchemaImpl = metadata => {
  if (metadata.schema) {
    return metadata.schema()
  }

  if (
    !metadata.type ||
    !metadata.type.innerTypes ||
    Object.keys(getInnerTypes$1([], metadata.type)).length === 0
  ) {
    return emptyObject
  }

  const baseSchema = { type: 'object' };
  const innerTypes = metadata.type.innerTypes();

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

  if (metadataRefCache.has(metadata)) {
    const ref = metadataRefCache.get(metadata);
    state.usedDefinitions.add(ref);
    return { $ref: `#/definitions/${ref}` }
  }

  if (topLevel) {
    state.nextRef = 1;
    state.definitions = {};
    state.usedDefinitions = new Set();
  }

  const ref = state.nextRef;

  metadataRefCache.set(metadata, ref);
  state.nextRef += 1;

  const schema = getSchemaImpl(metadata);
  metadataSchemaCache.set(metadata, schema);

  Object.assign(state.definitions, { [ref]: schema });

  if (!topLevel) {
    return schema
  }

  const definitions = getUsedDefinitions();

  if (Object.keys(definitions).length === 0) {
    return schema
  }

  if (!definitions.hasOwnProperty(ref)) {
    return Object.assign(schema, {definitions})
  }

  return {
    definitions: Object.assign(definitions, { [ref]: schema }),
    $ref: `#/definitions/${ref}`
  }
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

const getPathReducer = (result, part) => result.get(part);

class Base {
  constructor (Type, fields = emptyObject, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.displayName || Type.name} but got ${fields}`)
    }

    // This slows down the benchmarks by a lot, but it isn't clear whether
    // real usage would benefit from emoving it.
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

  static factory (...args) {
    return new Base(...args)
  }
}

var Base$1 = Object.freeze(Base);

const reviverFactory$2 = itemMetadata => (k, v, path) => {
  if (k !== '') {
    return v
  }

  const metadata = isFunction(itemMetadata)
    ? itemMetadata(v, path)
    : itemMetadata;

  const revive = (v === null)
    ? always(null)
    : defaultTo(metadata.reviver)(metadata.maybeReviver);

  return new Maybe(revive(k, v, path))
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

  get [Symbol.toStringTag] () {
    return 'ModelicoMaybe'
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
      reviver: reviverFactory$2(itemMetadata),
      default: Maybe.of()
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

const reviverFactory$3 = enumerators => (k, v, path = []) => {
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
  const immutableMap = thisArg.inner();
  const newImmutableMap = immutableMap.set(key, value);

  if (immutableMap === newImmutableMap) {
    return thisArg
  }

  return Type.fromArray([...newImmutableMap])
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

class AbstractMap extends Base$1 {
  constructor (Type, innerMapOrig = new Map(), EMPTY) {
    super(Type);

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map')
    }

    if (EMPTY && innerMapOrig.size === 0) {
      return EMPTY
    }

    const innerMap = Immutable.OrderedMap(innerMapOrig);

    this[innerOrigSymbol] = always(innerMap);
    this.inner = always(innerMap);
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

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const transform = asUnordered ? Immutable.Map : identity;

    return transform(this.inner()).equals(transform(other.inner()))
  }
}

var AbstractMap$1 = Object.freeze(AbstractMap);

const parseMapper = (keyReviver, valueReviver, path) => (pair, i) => [
  keyReviver('', pair[0], path.concat(i, 0)),
  valueReviver('', pair[1], path.concat(i, 1))
];

const reviverFactory$4 = (keyMetadata, valueMetadata) => (k, v, path = []) => {
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

const parseReducer = (valueReviver, obj, path) => (acc, key) =>
  [...acc, [key, valueReviver('', obj[key], path.concat(key))]];

const reviverFactory$5 = valueMetadata => (k, v, path = []) => {
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

const parseMapper$1 = (keyReviver, valueReviver, obj, path) => enumerator => {
  const key = keyReviver('', enumerator, path);
  const val = valueReviver('', obj[enumerator], path.concat(enumerator));

  return [key, val]
};

const reviverFactory$6 = (keyMetadata, valueMetadata) => (k, v, path = []) => {
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

  static innerTypes () {
    return emptyObject
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

  if (haveDifferentTypes(thisArg, other)) {
    return false
  }

  const transform = asUnordered ? Immutable.Set : identity;

  return transform(thisArg.inner()).equals(transform(other.inner()))
};

let EMPTY_LIST;

class List extends Base$1 {
  constructor (innerListOrig = []) {
    super(List);

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list')
    }

    if (EMPTY_LIST && innerListOrig.length === 0) {
      return EMPTY_LIST
    }

    Object.freeze(innerListOrig);
    const innerList = Immutable.List(innerListOrig);

    this.inner = always(innerList);
    this[innerOrigSymbol] = this.inner;
    this.size = innerList.size;

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
    return this.inner().get(index)
  }

  set (index, value) {
    const newList = [...this.inner().set(index, value)];

    return List.fromArray(newList)
  }

  setIn (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path;
    const item = this.inner().get(key);

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  toJSON () {
    return [...this.inner()]
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

class ModelicoSet extends Base$1 {
  constructor (innerSetOrig = new Set()) {
    super(ModelicoSet);

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    if (EMPTY_SET && innerSetOrig.size === 0) {
      return EMPTY_SET
    }

    const innerSet = Immutable.OrderedSet(innerSetOrig);

    this[innerOrigSymbol] = always(innerSet);
    this.inner = always(innerSet);
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
    const schema = getSchema(metadata, false);
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

const internalNonMutators = ['set', 'setIn'];

const mapNonMutators = internalNonMutators.concat(['delete', 'clear', 'update', 'merge', 'mergeWith', 'mergeDeep',
  'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'sortBy', 'slice', 'rest', 'butLast', 'skip',
  'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile', 'takeUntil', 'concat', 'withMutations']);
const mapMutators = [];

const setNonMutators = internalNonMutators.concat(['add', 'delete', 'clear', 'union', 'merge', 'intersect', 'subtract',
  'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'concat', 'withMutations']);
const setMutators = [];

const listNonMutators = internalNonMutators.concat(['delete', 'insert', 'clear', 'push', 'pop', 'unshift', 'shift',
  'update', 'merge', 'mergeWith', 'mergeDeep', 'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort',
  'sortBy', 'slice', 'rest', 'butLast', 'skip', 'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile',
  'takeUntil', 'concat', 'withMutations']);
const listMutators = [];

const dateNonMutators = internalNonMutators;
const dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds',
  'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth',
  'setUTCSeconds', 'setYear'];

const metadataCache = new WeakMap();

const base = Type =>
  Object.freeze({type: Type, reviver: reviverFactory(Type)});

const raw_ = (Type, innerMetadata) =>
  Type.metadata
    ? Type.metadata(...innerMetadata)
    : base(Type);

const _ = (Type, metadata = []) => {
  if (metadata.length > 0) {
    return raw_(Type, metadata)
  }

  if (!metadataCache.has(Type)) {
    metadataCache.set(Type, raw_(Type, metadata));
  }

  return metadataCache.get(Type)
};

const metadata = () => Object.freeze({
  _,
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

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity);
const genericsFromJS = (Type, innerMetadata, js) => _(Type, innerMetadata).reviver('', js);
const fromJS = (Type, js) => genericsFromJS(Type, [], js);
const ajvGenericsFromJS = (_, Type, schema, innerMetadata, js) => _(Type, schema, innerMetadata).reviver('', js);
const ajvFromJS = (_, Type, schema, js) => ajvGenericsFromJS(_, Type, schema, [], js);

const createModel = (innerTypes, stringTag = 'ModelicoModel') => {
  return class extends Base$1 {
    get [Symbol.toStringTag] () {
      return stringTag
    }

    static innerTypes (path, Type) {
      return (typeof innerTypes === 'function')
        ? innerTypes(path, Type)
        : Object.freeze(innerTypes)
    }
  }
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
  Base: Base$1,
  Set: ModelicoSet$1,
  createModel,
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
  proxyList: partial(proxyFactory, listNonMutators, listMutators, identity),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
};

export default M;
