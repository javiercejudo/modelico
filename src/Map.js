/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

const stringifyReducer = (acc, pair) => acc.concat({key: pair[0], value: pair[1]});
const parseReducer = (acc, pairObject) => acc.concat([[pairObject.key, pairObject.value]]);

class ModelicoMap extends Modelico {
  constructor(fields) {
    super(ModelicoMap, fields);
  }

  toJSON() {
    return (this.map === null) ? null : Array.from(this.map).reduce(stringifyReducer, []);
  }

  static buildReviver(key, value) {
    return ModelicoMap.reviver.bind(undefined, {key, value});
  }

  static reviver(types, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.reduce(parseReducer, []));

      return new ModelicoMap({map});
    }

    if (types && types[k] && 'reviver' in types[k]) {
      return Modelico.buildReviver(types[k])('', v);
    }

    return v;
  }
}

module.exports = ModelicoMap;
