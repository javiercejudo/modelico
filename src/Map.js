/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

const stringifyReducer = (acc, pair) => acc.concat({key: pair[0], value: pair[1]});
const parseReducer = (acc, pairObject) => acc.concat([[pairObject.key, pairObject.value]]);

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
      const map = (v === null) ? null : new Map(v.reduce(parseReducer, []));

      return new ModelicoMap(subtypes.key, subtypes.value, map);
    }

    if (subtypes && subtypes[k] && 'reviver' in subtypes[k]) {
      return Modelico.buildReviver(subtypes[k])('', v);
    }

    return v;
  }
}

module.exports = ModelicoMap;
