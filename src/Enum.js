'use strict';

import { always } from './U';
import Modelico from './Modelico';

const enumeratorsReducer = (acc, code) => (acc[code] = {code}) && acc;

const reviverFactory = enumerators => (k, v) => {
  return (v === null) ? null : enumerators[v];
};

class ModelicoEnum extends Modelico {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(ModelicoEnum, enumerators);

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => this[enumerator]().toJSON = always(enumerator));

    this.metadata = always(Object.freeze({
      type: ModelicoEnum,
      reviver: reviverFactory(enumerators)
    }));

    return Object.freeze(this);
  }
}

export default Object.freeze(ModelicoEnum);
