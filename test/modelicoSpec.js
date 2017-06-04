/* eslint-env mocha */

import Base from './types/Base'
import ModelicoNumber from './types/Number'
import ModelicoDate from './types/Date'
import ModelicoMap from './types/Map'
import ModelicoStringMap from './types/StringMap'
import ModelicoEnum from './types/Enum'
import ModelicoEnumMap from './types/EnumMap'
import ModelicoList from './types/List'
import ModelicoSet from './types/Set'
import ModelicoMaybe from './types/Maybe'

import asIs from './asIs'
import setIn from './types/setIn'

import featuresSimple from './features/simple'
import featuresAdvanced from './features/advanced'
import featuresAdvancedES5 from './features/advanced.es5'
import featuresDeepNesting from './features/deepNesting'
import featuresPolymorphic from './features/polymorphic'
import featuresValidate from './features/validate'
import featuresCache from './features/cache'
import featuresCustomSerialisation from './features/customSerialisation'
import ImmutableExamples from './Immutable/index'
import ImmutableProxied from './Immutable/proxied'

import proxyMap from './proxies/proxyMap'
import proxyList from './proxies/proxyList'
import proxySet from './proxies/proxySet'
import proxyDate from './proxies/proxyDate'

import cases from './cases/index'

import personFactory from './types/fixtures/Person'
import partOfDayFactory from './types/fixtures/PartOfDay'
import sexFactory from './types/fixtures/Sex'
import animalFactory from './types/fixtures/Animal'
import friendFactory from './types/fixtures/Friend'

import cityFactory from './types/fixtures/nested/City'
import countryFactory from './types/fixtures/nested/Country'
import regionFactory from './types/fixtures/nested/Region'
import regionIncompatibleNameKeyFactory
  from './types/fixtures/nested/RegionIncompatibleNameKey'

import fixerIoFactory from './api-examples/fixer-io/index'
import fixerIoSpec from './api-examples/fixer-io/fixerIoSpec'

import jsonSchemaMetadata from './metadata/jsonSchema'
import ajvMetadata from './metadata/ajv'
import baseMetadata from './metadata/base'
import withDefaultMetadata from './metadata/withDefault'
import unionMetadata from './metadata/union'
import singletonMetadata from './metadata/singleton'

import asyncReviving from './recipe/asyncReviving'
import binaryTree from './recipe/binaryTree'

const hasProxies = (() => {
  try {
    return new Proxy({}, {}) && true
  } catch (ignore) {
    // ignore
  }

  return false
})()

const hasToStringTagSymbol = (() => {
  const a = {}

  a[Symbol.toStringTag] = 'foo'

  return a + '' === '[object foo]'
})()

const identity = x => x
const pipe2 = (f, g) => x => g(f(x))
const pipe = (...fns) => [...fns, identity].reduce(pipe2)

// loosely based on https://bost.ocks.org/mike/shuffle/
const shuffle = arr => {
  for (let l = arr.length - 1; l > 0; l -= 1) {
    const i = Math.floor((l + 1) * Math.random())
    ;[arr[l], arr[i]] = [arr[i], arr[l]]
  }

  return arr
}

const buildUtils = () =>
  Object.freeze({
    skipIfNoProxies: fn => (hasProxies ? fn : fn.skip),
    skipIfNoToStringTagSymbol: fn => (hasToStringTagSymbol ? fn : fn.skip),
    objToArr: obj => Object.keys(obj).map(k => [k, obj[k]]),
    pipe,
    shuffle
  })

export default ({Should, Modelico: M, extensions}) => () => {
  const U = buildUtils()

  const PartOfDay = partOfDayFactory(M)
  const Sex = sexFactory(M)

  const fixtures = Object.freeze({
    cityFactory,
    countryFactory,
    fixerIoFactory,
    PartOfDay,
    Sex,
    Person: personFactory(M, PartOfDay, Sex),
    Animal: animalFactory(M),
    Friend: friendFactory(M),
    Region: regionFactory(M),
    RegionIncompatibleNameKey: regionIncompatibleNameKeyFactory(M)
  })

  const deps = [Should, M, fixtures, extensions]

  describe('Base', Base(U, ...deps))
  describe('Number', ModelicoNumber(U, ...deps))
  describe('Date', ModelicoDate(U, ...deps))
  describe('Map', ModelicoMap(U, ...deps))
  describe('StringMap', ModelicoStringMap(...deps))
  describe('Enum', ModelicoEnum(...deps))
  describe('EnumMap', ModelicoEnumMap(U, ...deps))
  describe('List', ModelicoList(U, ...deps))
  describe('Set', ModelicoSet(U, ...deps))
  describe('Maybe', ModelicoMaybe(U, ...deps))

  describe('asIs', asIs(U, ...deps))
  describe('setIn', setIn(U, ...deps))
  describe('jsonSchemaMetadata (other than Ajv)', jsonSchemaMetadata(...deps))
  describe('ajvMetadata', ajvMetadata(U, ...deps))
  describe('base metadata', baseMetadata(...deps))
  describe('withDefault metadata', withDefaultMetadata(...deps))
  describe('union metadata', unionMetadata(...deps))
  describe('Metadata as singletons', singletonMetadata(...deps))

  describe('Readme simple features', featuresSimple(...deps))
  describe('Readme advanced features', featuresAdvanced(...deps))
  describe('Readme advanced features ES5', featuresAdvancedES5(...deps))
  describe('Deep nesting features', featuresDeepNesting(...deps))
  describe('Reviving polymrphic JSON', featuresPolymorphic(...deps))
  describe('Validate', featuresValidate(...deps))
  describe('Cache', featuresCache(...deps))
  describe('Custom serialisation', featuresCustomSerialisation(...deps))
  describe('Immutable examples', ImmutableExamples(U, ...deps))

  describe('Api Example: Fixer IO', fixerIoSpec(...deps))
  describe('Async reviving', asyncReviving(...deps))
  describe('Binary tree', binaryTree(U, ...deps))

  U.skipIfNoProxies(describe)(
    'Immutable examples (proxied)',
    ImmutableProxied(U, ...deps)
  )

  U.skipIfNoProxies(describe)('Proxies', () => {
    describe('Map', proxyMap(...deps))
    describe('List', proxyList(...deps))
    describe('Set', proxySet(...deps))
    describe('Date', proxyDate(...deps))
  })

  describe('Cases', cases(...deps))
}
