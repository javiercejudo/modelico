/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoDate extends Modelico {
  constructor(date) {
    super(ModelicoDate, {date});

    this.date = () => date === null ? null : new Date(date.toISOString());
  }

  toJSON() {
    return (this.date() === null) ? null : this.date().toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return Object.freeze(new ModelicoDate(date));
  }

  static metadata() {
    return {type: ModelicoDate, reviver: ModelicoDate.reviver};
  }
}

module.exports = ModelicoDate;
