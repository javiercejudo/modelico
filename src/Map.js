/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

const stringifyReducer = (acc, pair) => acc.concat({key: pair[0], value: pair[1]});
const parseSingle = (reviver, value) => reviver('', value);

const parseReducer = subtypes => (acc, pairObject) => acc.concat([[
  parseSingle(subtypes.keyMetadata.reviver, pairObject.key),
  parseSingle(subtypes.valueMetadata.reviver, pairObject.value)
]]);

class ModelicoMap extends Modelico {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoMap, {map});

    this.subtypes = () => ({keyMetadata, valueMetadata});
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoMap.reviver.bind(undefined, this.subtypes()));
  }

  toJSON() {
    return (this.map === null) ? null : Array.from(this.map).reduce(stringifyReducer, []);
  }

  static buildReviver(keyMetadata, valueMetadata) {
    return ModelicoMap.reviver.bind(undefined, {keyMetadata, valueMetadata});
  }

  static reviver(subtypes, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.reduce(parseReducer(subtypes), []));

      return new ModelicoMap(subtypes.keyMetadata, subtypes.valueMetadata, map);
    }

    return v;
  }

  static metadata(keyMetadata, valueMetadata) {
    return {type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata)};
  }
}

module.exports = ModelicoMap;
