/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class Enum extends Modelico {
  constructor(fields) {
    super(Enum, fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field].toJSON = () => field);
  }

  static buildReviver(values) {
    return function reviver(k, v) {
      if (v === null) {
        return null;
      }

      return values[v];
    };
  }
}

module.exports = Enum;
