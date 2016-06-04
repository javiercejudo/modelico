'use strict';

import { always } from './U';
import { itemMetadataSymbol } from './symbols';
import { iterableMetadata } from './iterable';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoList extends Modelico {
  constructor(itemMetadata, inner) {
    super(ModelicoList, {});

    this[itemMetadataSymbol] = always(itemMetadata);
    this.inner = () => (inner === null) ? null : inner.slice();
    this[Symbol.iterator] = () => inner[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newList = this.inner();
    newList[index] = value;

    return new ModelicoList(this[itemMetadataSymbol](), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(this[itemMetadataSymbol](), value);
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
    return new ModelicoList(AsIs(Any), arr);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoList, itemMetadata);
  }
}

export default Object.freeze(ModelicoList);
