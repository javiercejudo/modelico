'use strict';

const hasObjectFreeze = (function(){
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

module.exports = (options, should, M) => _ => {
  const U = buildUtils(options);
  const deps = [should, M];
  const utilsAndDeps = [U].concat(deps);

  describe('ModelicoBase', require('./types/Modelico').apply(_, deps));
  describe('ModelicoAsIs', require('./types/AsIs').apply(_, utilsAndDeps));
  describe('ModelicoMap', require('./types/Map').apply(_, deps));
  describe('ModelicoEnumMap', require('./types/EnumMap').apply(_, deps));
  describe('ModelicoList', require('./types/List').apply(_, deps));
  describe('ModelicoSet', require('./types/Set').apply(_, deps));
  describe('Readme Simple Example', require('./example/simple').apply(_, deps));
  describe('Readme Advanced Example', require('./example/advanced').apply(_, deps));
  describe('Readme Advanced Example ES5', require('./example/advanced.es5').apply(_, deps));
  describe('Immutable.js examples', require('./Immutable.js/').apply(_, utilsAndDeps));

  U.skipDescribeIfNoProxies(
    'Immutable.js examples (proxied)',
    require('./Immutable.js/proxied').apply(_, utilsAndDeps)
  );

  U.skipDescribeIfNoProxies('Proxies', () => {
    describe('Map', require('./proxies/proxyMap').apply(_, deps));
    describe('List', require('./proxies/proxyList').apply(_, deps));
    describe('Set', require('./proxies/proxySet').apply(_, deps));
    describe('Date', require('./proxies/proxyDate').apply(_, deps));
  });
};
