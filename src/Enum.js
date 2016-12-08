'use strict';

import { always, isNothing } from './U';
import Base from './Base';

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

const reviverFactory = enumerators => ((k, v) => {
  const enumerator = enumerators[v];

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator (${v})`);
  }

  return enumerator;
});

class ModelicoEnum extends Base {
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

    Object.freeze(this);
  }
}

export default Object.freeze(ModelicoEnum);
