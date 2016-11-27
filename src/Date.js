'use strict';

import { isNothing } from './U';
import Modelico from './Modelico';

class ModelicoDate extends Modelico {
  constructor(date) {
    super(ModelicoDate, {});

    if (isNothing(date)) {
      throw TypeError('missing date');
    }

    this.inner = () => new Date(date.getTime());

    Object.freeze(this);
  }

  set(date) {
    return new ModelicoDate(date);
  }

  setPath(path, value) {
    return this.set(value);
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
