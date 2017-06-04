import {version, author, homepage, license} from '../package.json'
import * as symbols from './symbols'

import {
  T,
  always,
  formatAjvError,
  identity,
  isNothing,
  partial,
  pipe,
  mem,
  memFactory
} from './U'

import getSchema from './getSchema'
import validate from './validate'
import withValidation from './withValidation'
import withCache from './withCache'
import metadata from './metadata/metadata'
import jsonSchemaMetadata from './metadata/jsonSchemaMetadata'
import ajvMetadata from './metadata/ajvMetadata'

import Base from './types/Base'

import Maybe from './types/Maybe'
import Enum from './types/Enum'

import ModelicoMap from './types/Map'
import StringMap from './types/StringMap'
import EnumMap from './types/EnumMap'
import ModelicoNumber from './types/Number'
import ModelicoDate from './types/Date'
import List from './types/List'
import ModelicoSet from './types/Set'

import proxyFactory from './proxyFactory'
import createModel from './createModel'
import createUnionType from './createUnionType'

const {_} = metadata()

const internalNonMutators = ['set', 'setIn']

const mapNonMutators = internalNonMutators
const mapMutators = ['delete', 'clear']

const setNonMutators = internalNonMutators
const setMutators = ['add', 'delete', 'clear']

const listNonMutators = internalNonMutators.concat([
  'map',
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
  _(Type, innerMetadata, schema).reviver('', js)

const ajvFromJS = (_, Type, schema, js) =>
  ajvGenericsFromJS(_, Type, schema, [], js)

const createAjvModel = (ajv, innerTypes, options = {}) => {
  options.metadata = ajvMetadata(ajv)

  return createModel(innerTypes, options)
}

const createSimpleModel = (innerTypes, name) =>
  createModel(innerTypes, {stringTag: name})

export default {
  about: Object.freeze({version, author, homepage, license}),

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
  createSimpleModel,
  createAjvModel,
  createUnionType,

  new: Type => x => new Type(x),
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
  jsonSchemaMetadata,
  ajvMetadata,
  getSchema,
  validate,
  withValidation,
  withCache,
  proxyMap,

  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, x => [...x]),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, identity),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, identity),

  util: {
    T,
    always,
    formatAjvError,
    identity,
    isNothing,
    partial,
    pipe,
    mem,
    memFactory
  }
}
