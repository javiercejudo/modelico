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

const mapNonMutators = internalNonMutators
const mapMutators = ['delete', 'clear']

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
  proxyList: partial(proxyFactory, listNonMutators, listMutators, x => [...x]),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
}
