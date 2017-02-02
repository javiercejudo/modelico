/* eslint-env mocha */

const hasObjectFreeze = (() => {
  const a = {}

  try {
    Object.freeze(a)
  } catch (e) {
    return false
  }

  try {
    a.test = 1
    return false
  } catch (ignore) {}

  return true
})()

const hasProxies = (() => {
  try {
    return new Proxy({}, {}) && true
  } catch (ignore) {}

  return false
})()

const buildUtils = options => Object.freeze({
  skipIfNoProxies: hasProxies ? it : it.skip,
  skipDescribeIfNoProxies: hasProxies ? describe : describe.skip,
  skipIfNoObjectFreeze: hasObjectFreeze ? it : it.skip,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]])
})

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

import ajvMetadata from './metadata/ajv'

export default (options, should, M, Immutable, extensions) => () => {
  const U = buildUtils(options)

  const PartOfDay = partOfDayFactory(M)
  const Sex = sexFactory(M)

  const fixtures = Object.freeze({
    cityFactory,
    countryFactory,
    PartOfDay,
    Sex,
    Person: personFactory(M, PartOfDay, Sex),
    Animal: animalFactory(M),
    Friend: friendFactory(M),
    Region: regionFactory(M),
    RegionIncompatibleNameKey: regionIncompatibleNameKeyFactory(M)
  })

  const deps = [should, M, fixtures, Immutable, extensions]

  describe('Base', Base(U, ...deps))
  describe('Number', ModelicoNumber(...deps))
  describe('Date', ModelicoDate(...deps))
  describe('Map', ModelicoMap(...deps))
  describe('StringMap', ModelicoStringMap(...deps))
  describe('Enum', ModelicoEnum(...deps))
  describe('EnumMap', ModelicoEnumMap(...deps))
  describe('ModelicoList', ModelicoList(U, ...deps))
  describe('ModelicoSet', ModelicoSet(...deps))
  describe('ModelicoMaybe', ModelicoMaybe(...deps))

  describe('asIs', asIs(U, ...deps))
  describe('setIn', setIn(U, ...deps))
  describe('ajvMetadata', ajvMetadata(...deps))

  describe('Readme simple features', featuresSimple(...deps))
  describe('Readme advanced features', featuresAdvanced(...deps))
  describe('Readme advanced features ES5', featuresAdvancedES5(...deps))
  describe('Deep nesting features', featuresDeepNesting(...deps))
  describe('Immutable.js examples', ImmutableExamples(U, ...deps))

  U.skipDescribeIfNoProxies(
    'Immutable.js examples (proxied)',
    ImmutableProxied(U, ...deps)
  )

  U.skipDescribeIfNoProxies('Proxies', () => {
    describe('Map', proxyMap(...deps))
    describe('List', proxyList(...deps))
    describe('Set', proxySet(...deps))
    describe('Date', proxyDate(...deps))
  })

  describe('Cases', cases(...deps))
}
