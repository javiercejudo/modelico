'use strict';

import { isNothing, unsupported } from './U';
import Base from './Base';

class ModelicoDate extends Base {
  constructor(dateOrig) {
    super(ModelicoDate, {});

    if (isNothing(dateOrig)) {
      throw TypeError('missing date');
    }

    const date = new Date(dateOrig.getTime());;

    this.inner = () => new Date(date.getTime());

    Object.freeze(this);
  }

  set() {
    unsupported('Date.set is not supported');
  }

  setPath(path, date) {
    if (path.length === 0) {
      return new ModelicoDate(date);
    }

    unsupported('Date.setPath is not supported for non-empty paths');
  }

  toJSON() {
    return this.inner().toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return new ModelicoDate(date);
  }

  static metadata() {
    return Object.freeze({type: ModelicoDate, reviver: ModelicoDate.reviver});
  }
}

export default Object.freeze(ModelicoDate);
