'use strict';

import { isNothing, unsupported, emptyObject } from './U';
import Base from './Base';

const reviver = (k, v) => {
  const date = (v === null) ?
    null :
    new Date(v);

  return new ModelicoDate(date);
};

class ModelicoDate extends Base {
  constructor(dateOrig) {
    super(ModelicoDate);

    if (isNothing(dateOrig)) {
      throw TypeError('missing date');
    }

    const date = new Date(dateOrig.getTime());

    this.inner = () => new Date(date.getTime());

    Object.freeze(this);
  }

  set() {
    unsupported('Date.set is not supported');
  }

  setPath(path, date) {
    if (path.length === 0) {
      return ModelicoDate.of(date);
    }

    unsupported('Date.setPath is not supported for non-empty paths');
  }

  toJSON() {
    return this.inner().toISOString();
  }

  static of(date) {
    return new ModelicoDate(date);
  }

  static metadata() {
    return Object.freeze({type: ModelicoDate, reviver});
  }

  static innerTypes() {
    return emptyObject;
  }
}

ModelicoDate.displayName = 'ModelicoDate';

export default Object.freeze(ModelicoDate);
