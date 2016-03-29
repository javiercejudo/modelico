/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoMap extends Modelico {
  constructor(fields) {
    super(ModelicoMap, fields);
  }

  toJSON() {
    return (this.map === null) ? null : [...this.map];
  }

  static reviver(k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v);

      return new ModelicoMap({map});
    }

    // todo: check types to support custom revivers here (ala Modelico.js)

    return v;
  }
}

module.exports = ModelicoMap;
