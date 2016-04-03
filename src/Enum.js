'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class ModelicoEnum extends Modelico {
  constructor(fields) {
    super(ModelicoEnum, fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field]().toJSON = () => field);
  }

  static buildReviver(values) {
    return U.bind(ModelicoEnum.reviver, values);
  }

  static reviver(values, k, v) {
    return (v === null) ? null : values[v];
  }
}

module.exports = Object.freeze(ModelicoEnum);
