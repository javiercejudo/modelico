'use strict';

import { always } from './U';
import Modelico from './Modelico';

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

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

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: ModelicoEnum,
        reviver: reviverFactory(enumerators)
      })),
      enumerable: false
    });

    return Object.freeze(this);
  }
}

export default Object.freeze(ModelicoEnum);
