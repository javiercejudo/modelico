'use strict';

import { always, isNothing, emptyObject } from './U';
import Base from './Base';

const enumeratorsReducer = (acc, code) => Object.assign(acc, { [code]: { code } });

const reviverFactory = enumerators => (k, v) => {
  const enumerator = enumerators[v];

  if (isNothing(enumerator)) {
    throw TypeError(`missing enumerator (${v})`);
  }

  return enumerator;
};

class Enum extends Base {
  constructor(input) {
    const enumerators = Array.isArray(input) ?
      input.reduce(enumeratorsReducer, {}) :
      input;

    super(Enum, {});

    Object.getOwnPropertyNames(enumerators)
      .forEach(enumerator => {
        this[enumerator] = always(enumerators[enumerator]);
        this[enumerator]().toJSON = always(enumerator)
      });

    Object.defineProperty(this, 'metadata', {
      value: always(Object.freeze({
        type: Enum,
        reviver: reviverFactory(enumerators)
      })),
      enumerable: false
    });

    Object.freeze(this);
  }

  static innerTypes() {
    return emptyObject;
  }
}

Enum.displayName = 'Enum';

export default Object.freeze(Enum);
