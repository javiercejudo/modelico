import { version, author, homepage, license } from '../package.json'
import * as symbols from './symbols'
import { partial, always, identity } from './U'
import reviverFactory from './reviverFactory'
import getSchema from './getSchema'

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

const _ = function (Type, path = [], innerMetadata = []) {
  if (Type.metadata) {
    return Type.metadata(...innerMetadata)
  }

  return Object.freeze({type: Type, reviver: reviverFactory(path, Type)})
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
  set: ModelicoSet.metadata,

  withDefault: (meta, defaultValue) =>
    Object.freeze(Object.assign({}, meta, { default: defaultValue }))
})

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity)
const fromJS = (Type, js) => _(Type).reviver('', js)
const genericsFromJS = (Type, innerMetadata, js) => _(Type, [], innerMetadata).reviver('', js)
const ajvFromJS = (_, Type, schema, js) => _(Type, schema).reviver('', js)
const ajvGenericsFromJS = (_, Type, schema, innerMetadata, js) => _(Type, schema, [], innerMetadata).reviver('', js)

const createModel = (innerTypes, stringTag = 'ModelicoModel', getType) => {
  return class extends Base {
    constructor (Ctor, props = {}) {
      super(Ctor, props)
    }

    get [Symbol.toStringTag] () {
      return stringTag
    }

    static of (props) {
      return fromJS(getType(), props)
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
  proxyMap,
  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, x => [...x]),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity)
}
