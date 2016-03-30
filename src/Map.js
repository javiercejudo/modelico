/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

const stringifyReducer = (acc, pair) => acc.concat({key: pair[0], value: pair[1]});
const parseSingle = (type, value) => ('reviver' in type) ? Modelico.buildReviver(type)('', value) : value;

const parseReducer = subtypes => (acc, pairObject) => acc.concat([[
  parseSingle(subtypes.key, pairObject.key),
  parseSingle(subtypes.value, pairObject.value)
]]);

class ModelicoMap extends Modelico {
  constructor(key, value, map) {
    super(ModelicoMap, {map});

    this.subtypes = () => ({key, value});
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoMap.reviver.bind(undefined, this.subtypes()));
  }

  toJSON() {
    return (this.map === null) ? null : Array.from(this.map).reduce(stringifyReducer, []);
  }

  static buildReviver(key, value) {
    return ModelicoMap.reviver.bind(undefined, {key, value});
  }

  static reviver(subtypes, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.reduce(parseReducer(subtypes), []));

      return new ModelicoMap(subtypes.key, subtypes.value, map);
    }

    return v;
  }

  static metadata(key, value) {
    return {type: ModelicoMap, reviver: ModelicoMap.buildReviver(key, value)};
  }
}

module.exports = ModelicoMap;
