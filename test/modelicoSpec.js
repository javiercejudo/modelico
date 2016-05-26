'use strict';

const hasObjectFreeze = (() => {
  const a = {};

  try{
    Object.freeze(a);
  } catch(e) {
    return false;
  }

  try {
    a.test = 1;
    return false;
  } catch(ignore) {}

  return true;
})();

const hasProxies = (() => {
  try {
    new Proxy({}, {});

    return true;
  } catch (ignore) {}

  return false;
})();

const buildUtils = options => Object.freeze({
  skipIfNoProxies: hasProxies ? it : it.skip,
  skipDescribeIfNoProxies: hasProxies ? describe : describe.skip,
  skipIfNoObjectFreeze: hasObjectFreeze ? it : it.skip,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]])
});

import Modelico from './types/Modelico';
import ModelicoAsIs from './types/AsIs';
import ModelicoMap from './types/Map';
import ModelicoEnumMap from './types/EnumMap';
import ModelicoList from './types/List';
import ModelicoSet from './types/Set';

import setPath from './types/setPath';

import featuresSimple from './features/simple';
import featuresAdvanced from './features/advanced';
import featuresAdvancedES5 from './features/advanced.es5';
import featuresDeepNesting from './features/deepNesting';
import featuresSchema from './features/schema';
import Immutable from './Immutable.js/index';
import ImmutableProxied from './Immutable.js/proxied';

import proxyMap from './proxies/proxyMap';
import proxyList from './proxies/proxyList';
import proxySet from './proxies/proxySet';
import proxyDate from './proxies/proxyDate';

import cases from './cases/index';

export default (options, should, M) => () => {
  const U = buildUtils(options);
  const deps = [should, M];
  const utilsAndDeps = [U].concat(deps);

  describe('Base', Modelico(...deps));
  describe('AsIs', ModelicoAsIs(...utilsAndDeps));
  describe('Map', ModelicoMap(...deps));
  describe('EnumMap', ModelicoEnumMap(...deps));
  describe('ModelicoList', ModelicoList(...deps));
  describe('ModelicoSet', ModelicoSet(...deps));

  describe('setPath', setPath(...deps));

  describe('Readme simple features', featuresSimple(...deps));
  describe('Readme advanced features', featuresAdvanced(...deps));
  describe('Readme advanced features ES5', featuresAdvancedES5(...deps));
  describe('Deep nesting features', featuresDeepNesting(...deps));
  describe('Schema', featuresSchema(...[options].concat(deps)));
  describe('Immutable.js examples', Immutable(...utilsAndDeps));

  U.skipDescribeIfNoProxies(
    'Immutable.js examples (proxied)',
    ImmutableProxied(...utilsAndDeps)
  );

  U.skipDescribeIfNoProxies('Proxies', () => {
    describe('Map', proxyMap(...deps));
    describe('List', proxyList(...deps));
    describe('Set', proxySet(...deps));
    describe('Date', proxyDate(...deps));
  });

  describe('Cases', cases(...deps));
};
