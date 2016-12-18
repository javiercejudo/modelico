import { version, author, homepage, license } from '../package.json'
import { fieldsSymbol } from './symbols'
import { partial, always } from './U'
import reviverFactory from './reviverFactory'

import Base from './Base'

import Maybe from './Maybe'
import Enum from './Enum'

import ModelicoMap from './Map'
import EnumMap from './EnumMap'
import ModelicoNumber from './Number'
import ModelicoDate from './Date'
import List from './List'
import ModelicoSet from './Set'
import Any from './Any'
import proxyFactory from './proxyFactory'

import asIs from './asIs'

const internalNonMutators = ['set', 'setPath']

const mapNonMutators = internalNonMutators
const mapMutators = ['set', 'delete', 'clear']

const setNonMutators = internalNonMutators
const setMutators = ['add', 'delete', 'clear']

const listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter'])
const listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']

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

const metadata = Object.freeze({
  _,
  asIs,
  any: always(asIs(Any)),
  number: ({ wrap = false } = {}) => wrap ? ModelicoNumber.metadata() : asIs(Number),

  string: always(asIs(String)),
  boolean: always(asIs(Boolean)),
  regExp: always(asIs(RegExp)),
  fn: always(asIs(Function)),

  date: ModelicoDate.metadata,
  enumMap: EnumMap.metadata,
  list: List.metadata,
  map: ModelicoMap.metadata,
  maybe: Maybe.metadata,
  set: ModelicoSet.metadata
})

export default {
  about: Object.freeze({ version, author, homepage, license }),
  Any,
  Number: ModelicoNumber,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  Maybe,
  Base,
  Set: ModelicoSet,
  fields: x => x[fieldsSymbol](),
  fromJSON: (Type, json) => JSON.parse(json, _(Type).reviver),
  genericsFromJSON: (Type, innerMetadata, json) => JSON.parse(json, _(Type, 0, innerMetadata).reviver),
  metadata,
  proxyMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyEnumMap: partial(proxyFactory, mapNonMutators, mapMutators),
  proxyList: partial(proxyFactory, listNonMutators, listMutators),
  proxySet: partial(proxyFactory, setNonMutators, setMutators),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators)
}
