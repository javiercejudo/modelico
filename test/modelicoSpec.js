'use strict';

const buildUtils = (options) => Object.freeze({
  skipIfLegacyIE: options.legacyIE ? it.skip : it,
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
  describe('Readme Simple Example', require('./example/simple').apply(_, deps));
  describe('Readme Advanced Example', require('./example/advanced').apply(_, deps));
  describe('Readme Advanced Example ES5', require('./example/advanced.es5').apply(_, deps));
  describe('Immutable.js examples', require('./Immutable.js/').apply(_, utilsAndDeps));
};
