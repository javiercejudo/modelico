import { version, author, homepage, license } from '../package.json'
import * as symbols from './symbols'
import { partial, always, identity, reviverOrAsIs } from './U'
import reviverFactory from './reviverFactory'
import getSchema from './getSchema'
import validate from './validate'
import withValidation from './withValidation'

import Base from './Base'

import Maybe from './Maybe'
import Enum from './Enum'

import ModelicoMap from './Map'
import StringMap from './StringMap'
import EnumMap from './EnumMap'
import ModelicoNumber from './Number'
import ModelicoDate from './Date'
import List from './List'
import ModelicoSet from './Set'
import proxyFactory from './proxyFactory'
import ajvMetadata from './ajvMetadata'

import asIs from './asIs'
import any from './any'
import anyOf from './anyOf'

const internalNonMutators = ['set', 'setIn']

const mapNonMutators = internalNonMutators.concat(['delete', 'clear', 'update', 'merge', 'mergeWith', 'mergeDeep',
  'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'sortBy', 'slice', 'rest', 'butLast', 'skip',
  'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile', 'takeUntil', 'concat', 'withMutations'])
const mapMutators = []

const setNonMutators = internalNonMutators.concat(['add', 'delete', 'clear', 'union', 'merge', 'intersect', 'subtract',
  'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort', 'concat', 'withMutations'])
const setMutators = []

const listNonMutators = internalNonMutators.concat(['delete', 'insert', 'clear', 'push', 'pop', 'unshift', 'shift',
  'update', 'merge', 'mergeWith', 'mergeDeep', 'mergeDeepWith', 'map', 'filter', 'filterNot', 'reverse', 'sort',
  'sortBy', 'slice', 'rest', 'butLast', 'skip', 'skipLast', 'skipWhile', 'skipUntil', 'take', 'takeLast', 'takeWhile',
  'takeUntil', 'concat', 'withMutations'])
const listMutators = []

const dateNonMutators = internalNonMutators
const dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds',
  'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth',
  'setUTCSeconds', 'setYear']

const metadataCache = new WeakMap()

const base = Type =>
  Object.freeze({type: Type, reviver: reviverFactory(Type)})

const raw_ = (Type, innerMetadata) =>
  Type.metadata
    ? Type.metadata(...innerMetadata)
    : base(Type)

const _ = (Type, metadata = []) => {
  if (metadata.length > 0) {
    return raw_(Type, metadata)
  }

  if (!metadataCache.has(Type)) {
    metadataCache.set(Type, raw_(Type, metadata))
  }

  return metadataCache.get(Type)
}

const metadata = () => Object.freeze({
  _,
  base,
  asIs,
  any,
  anyOf,
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),

  date: ModelicoDate.metadata,
  enumMap: EnumMap.metadata,
  list: List.metadata,
  map: ModelicoMap.metadata,
  stringMap: StringMap.metadata,
  maybe: Maybe.metadata,
  set: ModelicoSet.metadata,

  withDefault: (metadata, def) => {
    const defaultValue = reviverOrAsIs(metadata)('', def)

    return Object.freeze(Object.assign({}, metadata, { default: defaultValue }))
  }
})

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity)
const genericsFromJS = (Type, innerMetadata, js) => _(Type, innerMetadata).reviver('', js)
const fromJS = (Type, js) => genericsFromJS(Type, [], js)
const ajvGenericsFromJS = (_, Type, schema, innerMetadata, js) => _(Type, schema, innerMetadata).reviver('', js)
const ajvFromJS = (_, Type, schema, js) => ajvGenericsFromJS(_, Type, schema, [], js)

const createModel = (innerTypes, stringTag = 'ModelicoModel') => {
  return class extends Base {
    get [Symbol.toStringTag] () {
      return stringTag
    }

    static innerTypes (path, Type) {
      return (typeof innerTypes === 'function')
        ? innerTypes(path, Type)
        : Object.freeze(innerTypes)
    }
  }
}

export default {
  about: Object.freeze({ version, author, homepage, license }),
  Number: ModelicoNumber,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  StringMap,
  Maybe,
  Base,
  Set: ModelicoSet,
  createModel,
  fields: x => x[symbols.fieldsSymbol](),
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
}
