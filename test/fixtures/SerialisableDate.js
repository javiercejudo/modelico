/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('../../').Modelico;

class SerialisableDate extends Modelico {
  constructor(fields) {
    super(SerialisableDate, fields);
  }

  toJSON() {
    if (this.date === null) {
      return null;
    }

    return this.date.toISOString();
  }

  static reviver(k, v) {
    let date = null;

    if (v !== null) {
      date = new Date(v);
    }

    return new SerialisableDate({date});
  }
}

module.exports = SerialisableDate;
