'use strict';

import U from './U';
import Modelico from './Modelico';

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
      .forEach(enumerator => this[enumerator]().toJSON = U.always(enumerator));

    this.metadata = U.always(Object.freeze({
      type: ModelicoEnum,
      reviver: U.bind(reviver, enumerators)
    }));

    return Object.freeze(this);
  }
}

export default Object.freeze(ModelicoEnum);
