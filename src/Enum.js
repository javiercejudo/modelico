/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoEnum extends Modelico {
  constructor(fields) {
    super(ModelicoEnum, fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field].toJSON = () => field);
  }

  static reviver(values, k, v) {
    return (v === null) ? null : values[v];
  }
}

module.exports = ModelicoEnum;
