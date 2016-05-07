'use strict';

import { always, iterableMetadata } from './U';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoSet extends Modelico {
  constructor(itemMetadata, innerSet) {
    super(ModelicoSet, {innerSet});

    this.itemMetadata = always(itemMetadata);
    this.innerSet = () => (innerSet === null) ? null : new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = Array.from(this.innerSet());
    newSet[index] = value;

    return new ModelicoSet(this.itemMetadata(), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(this.itemMetadata(), value);
    }

    const item = Array.from(this.innerSet())[path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this.fields().innerSet;

    return (innerSet === null) ? null : Array.from(innerSet);
  }

  static fromArray(arr) {
    return ModelicoSet.fromSet(new Set(arr));
  }

  static fromSet(set) {
    return new ModelicoSet(AsIs(Any), set);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoSet, itemMetadata);
  }
}

export default Object.freeze(ModelicoSet);
