'use strict';

import Modelico from './Modelico';

class ModelicoDate extends Modelico {
  constructor(date) {
    super(ModelicoDate, {});

    this.inner = () => date === null ? null : new Date(date.getTime());

    return Object.freeze(this);
  }

  set(date) {
    return new ModelicoDate(date);
  }

  setPath(path, value) {
    return this.set(value);
  }

  toJSON() {
    const date = this.inner();

    return (date === null) ? null : date.toISOString();
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
