'use strict';

import { always, isNothing } from './U';
import { iterableMetadata } from './iterable';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoSet extends Modelico {
  constructor(innerSetOrig) {
    super(ModelicoSet, {});

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set');
    }

    const innerSet = new Set(innerSetOrig);

    this.inner = () => new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    Object.freeze(this);
  }

  set(index, value) {
    const newSet = [...this.inner()];
    newSet[index] = value;

    return new ModelicoSet(newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(value);
    }

    const item = [...this.inner()][path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return [...this.inner()];
  }

  static fromSet(set) {
    return new ModelicoSet(set);
  }

  static fromArray(arr) {
    return ModelicoSet.fromSet(new Set(arr));
  }

  static of(...arr) {
    return ModelicoSet.fromArray(arr);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoSet, itemMetadata);
  }
}

ModelicoSet.EMPTY = ModelicoSet.of();

export default Object.freeze(ModelicoSet);
