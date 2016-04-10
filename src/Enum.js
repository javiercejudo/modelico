'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

const enumeratorsReducer = (acc, code) => (acc[code] = {code}) && acc;

const reviver = (values, k, v) => {
  return (v === null) ? null : values[v];
};

class ModelicoEnum extends Modelico {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(ModelicoEnum, enumerators);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => this[enumerator]().toJSON = () => enumerator);

    this.metadata = () => Object.freeze({
      type: ModelicoEnum,
      reviver: U.bind(reviver, enumerators)
    });

    Object.freeze(this);
  }
}

module.exports = Object.freeze(ModelicoEnum);
