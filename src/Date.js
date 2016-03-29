/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoDate extends Modelico {
  constructor(fields) {
    super(ModelicoDate, fields);
  }

  toJSON() {
    return (this.date === null) ? null : this.date.toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return new ModelicoDate({date});
  }
}

module.exports = ModelicoDate;
