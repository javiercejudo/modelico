/*jshint node:true, esnext:true */

'use strict';

module.exports = M => {
  const Modelico = M.Modelico;

  class SerialisableDate extends Modelico {
    constructor(date) {
      super(SerialisableDate, {date});

      this.date = () => date === null ? null : new Date(date.toISOString());
      Object.freeze(this);
    }

    toJSON() {
      return (this.date() === null) ? null : this.date().toISOString();
    }

    static reviver(k, v) {
      const date = (v === null) ? null : new Date(v);

      return Object.freeze(new SerialisableDate(date));
    }

    static metadata() {
      return Object.freeze({
        type: SerialisableDate,
        reviver: SerialisableDate.reviver
      });
    }
  }

  return Object.freeze(SerialisableDate);
};
