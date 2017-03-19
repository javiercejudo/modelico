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
import ImmutableExamples from './Immutable.js/index'
import ImmutableProxied from './Immutable.js/proxied'

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
import regionIncompatibleNameKeyFactory from './types/fixtures/nested/RegionIncompatibleNameKey'

import fixerIoFactory from './api-examples/fixer-io/index'
import fixerIoSpec from './api-examples/fixer-io/fixerIoSpec'

import ajvMetadata from './metadata/ajv'
import baseMetadataExample from './metadata/base'

const hasProxies = (() => {
  try {
    return new Proxy({}, {}) && true
  } catch (ignore) {}

  return false
})()

const hasToStringTagSymbol = (() => {
  const a = {}

  a[Symbol.toStringTag] = 'foo'

  return (a + '') === '[object foo]'
})()

const buildUtils = () => Object.freeze({
  skipIfNoProxies: fn => hasProxies ? fn : fn.skip,
  skipIfNoToStringTagSymbol: fn => hasToStringTagSymbol ? fn : fn.skip,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]])
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
  describe('ajvMetadata', ajvMetadata(...deps))
  describe('base metadata example', baseMetadataExample(...deps))

  describe('Readme simple features', featuresSimple(...deps))
  describe('Readme advanced features', featuresAdvanced(...deps))
  describe('Readme advanced features ES5', featuresAdvancedES5(...deps))
  describe('Deep nesting features', featuresDeepNesting(...deps))
  describe('Reviving polymrphic JSON', featuresPolymorphic(...deps))
  describe('Immutable.js examples', ImmutableExamples(U, ...deps))

  describe('Api Example: Fixer IO', fixerIoSpec(...deps))

  U.skipIfNoProxies(describe)(
    'Immutable.js examples (proxied)',
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
