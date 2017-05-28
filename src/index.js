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
  mem
} from './U'

import getSchema from './getSchema'
import validate from './validate'
import withValidation from './withValidation'
import withCache from './withCache'
import metadata from './metadata/metadata'
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

const mapNonMutators = internalNonMutators.concat([
  'delete',
  'clear',
  'update',
  'merge',
  'mergeWith',
  'mergeDeep',
  'mergeDeepWith',
  'map',
  'filter',
  'filterNot',
  'reverse',
  'sort',
  'sortBy',
  'slice',
  'rest',
  'butLast',
  'skip',
  'skipLast',
  'skipWhile',
  'skipUntil',
  'take',
  'takeLast',
  'takeWhile',
  'takeUntil',
  'concat',
  'withMutations'
])

const mapMutators = []

const setNonMutators = internalNonMutators.concat([
  'add',
  'delete',
  'clear',
  'union',
  'merge',
  'intersect',
  'subtract',
  'mergeDeepWith',
  'map',
  'filter',
  'filterNot',
  'reverse',
  'sort',
  'concat',
  'withMutations'
])

const setMutators = []

const listNonMutators = internalNonMutators.concat([
  'delete',
  'insert',
  'clear',
  'push',
  'pop',
  'unshift',
  'shift',
  'update',
  'merge',
  'mergeWith',
  'mergeDeep',
  'mergeDeepWith',
  'map',
  'filter',
  'filterNot',
  'reverse',
  'sort',
  'sortBy',
  'slice',
  'rest',
  'butLast',
  'skip',
  'skipLast',
  'skipWhile',
  'skipUntil',
  'take',
  'takeLast',
  'takeWhile',
  'takeUntil',
  'concat',
  'withMutations'
])

const listMutators = []

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
  ajvMetadata,
  getSchema,
  validate,
  withValidation,
  withCache,
  proxyMap,

  proxyEnumMap: proxyMap,
  proxyStringMap: proxyMap,
  proxyList: partial(proxyFactory, listNonMutators, listMutators, identity),
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
    mem
  }
}
