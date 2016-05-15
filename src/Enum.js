'use strict';

import { always } from './U';
import { checkNull } from './checks';
import Modelico from './Modelico';

const enumeratorsReducer = (acc, code) => (acc[code] = {code}) && acc;

const reviverFactory = (options, enumerators) => (k, v) => {
  checkNull('Enum', {options}, 'enumerators')(v);

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

    this.metadataWithOptions = options => Object.freeze({
      type: ModelicoEnum,
      reviver: reviverFactory(options, enumerators),
      options
    });

    this.metadata = always(this.metadataWithOptions({}));

    return Object.freeze(this);
  }
}

export default Object.freeze(ModelicoEnum);
