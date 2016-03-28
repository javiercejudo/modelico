/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('../../').Modelico;

class SerialisableDate extends Modelico {
  constructor(fields) {
    super(SerialisableDate, fields);
  }

  toJSON() {
    return (this.date === null) ? null : this.date.toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return new SerialisableDate({date});
  }
}

module.exports = SerialisableDate;
