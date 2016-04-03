'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

const cloneViaJSON = x => JSON.parse(JSON.stringify(x));

class ModelicoAsIs extends Modelico {
  constructor(type, value) {
    super(type, {value});

    this.value = () => cloneViaJSON(value);

    Object.freeze(this);
  }

  toJSON() {
    return this.value();
  }

  static buildReviver(type) {
    return U.bind(ModelicoAsIs.reviver, type);
  }

  static reviver(type, k, v) {
    return v;
  }

  static metadata(type) {
    return Object.freeze({type: type, reviver: ModelicoAsIs.buildReviver(type)});
  }
}

module.exports = Object.freeze(ModelicoAsIs);
