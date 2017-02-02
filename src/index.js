import { version, author, homepage, license } from '../package.json'
import * as symbols from './symbols'
import { partial, always, identity } from './U'
import reviverFactory from './reviverFactory'

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

const _ = function (Type, depth = 0, innerMetadata = []) {
  if (Type.metadata) {
    return Type.metadata(...innerMetadata)
  }

  return Object.freeze({type: Type, reviver: reviverFactory(depth, Type)})
}

const metadata = () => Object.freeze({
  _,
  asIs,
  any: always(asIs(identity)),
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),

  date: ModelicoDate.metadata,
  enumMap: EnumMap.metadata,
  list: List.metadata,
  map: ModelicoMap.metadata,
  stringMap: StringMap.metadata,
  maybe: Maybe.metadata,
  set: ModelicoSet.metadata
})

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity)

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
  fields: x => x[symbols.fieldsSymbol](),
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
  proxyList: partial(proxyFactory, listNonMutators, listMutators, identity),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
}
