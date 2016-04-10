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

  set(value) {
    return new ModelicoAsIs(this.type(), value);
  }

  setPath(path, value) {
    return this.set(value);
  }

  toJSON() {
    return this.value();
  }

  static metadata(type) {
    return Object.freeze({type: type, reviver: U.identityReviver});
  }
}

module.exports = Object.freeze(ModelicoAsIs);
