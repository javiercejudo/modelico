'use strict';

import { always, isNothing } from './U';
import { iterableMetadata } from './iterable';
import Base from './Base';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoList extends Base {
  constructor(innerListOrig) {
    super(ModelicoList, {});

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list');
    }

    const innerList = [...innerListOrig];

    this.inner = () => [...innerList];
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    Object.freeze(this);
  }

  set(index, value) {
    const newList = this.inner();
    newList[index] = value;

    return new ModelicoList(newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(value);
    }

    const item = this.inner()[path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this.inner();
  }

  static fromArray(arr) {
    return new ModelicoList(arr);
  }

  static of(...arr) {
    return ModelicoList.fromArray(arr);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoList, itemMetadata);
  }
}

ModelicoList.EMPTY = ModelicoList.of();

export default Object.freeze(ModelicoList);
