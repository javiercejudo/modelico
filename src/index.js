import {version, author, homepage, license} from '../package.json'
import * as symbols from './symbols'
import {partial, identity} from './U'
import getSchema from './getSchema'
import validate from './validate'
import withValidation from './withValidation'
import metadata from './metadata'

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
import createModel from './createModel'

const {_} = metadata()

const internalNonMutators = ['set', 'setIn']

const mapNonMutators = internalNonMutators
const mapMutators = ['delete', 'clear']

const setNonMutators = internalNonMutators
const setMutators = ['add', 'delete', 'clear']

const listNonMutators = internalNonMutators.concat([
  'concat',
  'slice',
  'filter'
])
const listMutators = [
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift'
]

const dateNonMutators = internalNonMutators
const dateMutators = [
  'setDate',
  'setFullYear',
  'setHours',
  'setMinutes',
  'setMilliseconds',
  'setMonth',
  'setSeconds',
  'setTime',
  'setUTCDate',
  'setUTCFullYear',
  'setUTCHours',
  'setUTCMilliseconds',
  'setUTCMinutes',
  'setUTCMonth',
  'setUTCSeconds',
  'setYear'
]

const proxyMap = partial(proxyFactory, mapNonMutators, mapMutators, identity)
const genericsFromJS = (Type, innerMetadata, js) =>
  _(Type, innerMetadata).reviver('', js)
const fromJS = (Type, js) => genericsFromJS(Type, [], js)
const ajvGenericsFromJS = (_, Type, schema, innerMetadata, js) =>
  _(Type, schema, innerMetadata).reviver('', js)
const ajvFromJS = (_, Type, schema, js) =>
  ajvGenericsFromJS(_, Type, schema, [], js)

const createAjvModel = (ajv, innerTypes, options = {}) => {
  options.metadata = ajvMetadata(ajv)

  return createModel(innerTypes, options)
}

export default {
  about: Object.freeze({
    version,
    author,
    homepage,
    license
  }),
  Number: ModelicoNumber,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  StringMap,
  Maybe,
  Just: Maybe.Just,
  Nothing: Maybe.Nothing,
  Base,
  Set: ModelicoSet,
  createModel,
  createAjvModel,
  fields: x => x[symbols.fieldsSymbol](),
  symbols,
  fromJS,
  genericsFromJS,
  fromJSON: (Type, json) => fromJS(Type, JSON.parse(json)),
  genericsFromJSON: (Type, innerMetadata, json) =>
    genericsFromJS(Type, innerMetadata, JSON.parse(json)),
  ajvFromJS,
  ajvGenericsFromJS,
  ajvFromJSON: (_, Type, schema, json) =>
    ajvFromJS(_, Type, schema, JSON.parse(json)),
  ajvGenericsFromJSON: (_, Type, schema, innerMetadata, json) =>
    ajvGenericsFromJS(_, Type, schema, innerMetadata, JSON.parse(json)),
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
}
