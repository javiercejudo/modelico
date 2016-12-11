'use strict';

import { always, isNothing, unsupported, emptyObject } from './U';
import { iterableMetadata } from './iterable';
import Base from './Base';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoSet extends Base {
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

  set() {
    unsupported('Set.set is not supported');
  }

  setPath(path, set) {
    if (path.length === 0) {
      return new ModelicoSet(set);
    }

    unsupported('Set.setPath is not supported for non-empty paths');
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

  static innerTypes() {
    return emptyObject;
  }
}

ModelicoSet.displayName = 'ModelicoSet';
ModelicoSet.EMPTY = ModelicoSet.of();

export default Object.freeze(ModelicoSet);
