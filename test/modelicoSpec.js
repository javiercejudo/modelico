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

const buildUtils = (options) => Object.freeze({
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

import exampleSimple from './example/simple';
import exampleAdvanced from './example/advanced';
import exampleAdvancedES5 from './example/advanced.es5';
import exampleDeepNesting from './example/deepNesting';
import Immutable from './Immutable.js/index';
import ImmutableProxied from './Immutable.js/proxied';

import proxyMap from './proxies/proxyMap';
import proxyList from './proxies/proxyList';
import proxySet from './proxies/proxySet';
import proxyDate from './proxies/proxyDate';

export default (options, should, M) => _ => {
  const U = buildUtils(options);
  const deps = [should, M];
  const utilsAndDeps = [U].concat(deps);

  describe('Base', Modelico.apply(_, deps));
  describe('AsIs', ModelicoAsIs.apply(_, utilsAndDeps));
  describe('Map', ModelicoMap.apply(_, deps));
  describe('EnumMap', ModelicoEnumMap.apply(_, deps));
  describe('ModelicoList', ModelicoList.apply(_, deps));
  describe('ModelicoSet', ModelicoSet.apply(_, deps));

  describe('setPath', setPath.apply(_, deps));

  describe('Readme simple example', exampleSimple.apply(_, deps));
  describe('Readme advanced example', exampleAdvanced.apply(_, deps));
  describe('Readme advanced example ES5', exampleAdvancedES5.apply(_, deps));
  describe('Deep nesting example', exampleDeepNesting.apply(_, deps));
  describe('Immutable.js examples', Immutable.apply(_, utilsAndDeps));

  U.skipDescribeIfNoProxies(
    'Immutable.js examples (proxied)',
    ImmutableProxied.apply(_, utilsAndDeps)
  );

  U.skipDescribeIfNoProxies('Proxies', () => {
    describe('Map', proxyMap.apply(_, deps));
    describe('List', proxyList.apply(_, deps));
    describe('Set', proxySet.apply(_, deps));
    describe('Date', proxyDate.apply(_, deps));
  });
};
