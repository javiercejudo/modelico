'use strict';

import { always } from './U';
import { fieldsSymbol, innerSymbol, itemMetadataSymbol } from './symbols';
import { iterableMetadata } from './iterable';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoSet extends Modelico {
  constructor(itemMetadata, innerSet) {
    super(ModelicoSet, {innerSet});

    this[itemMetadataSymbol] = always(itemMetadata);
    this[innerSymbol] = () => (innerSet === null) ? null : new Set(innerSet);
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = [...this[innerSymbol]()];
    newSet[index] = value;

    return new ModelicoSet(this[itemMetadataSymbol](), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoSet(this[itemMetadataSymbol](), value);
    }

    const item = [...this[innerSymbol]()][path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this[fieldsSymbol]().innerSet;

    return (innerSet === null) ? null : [...innerSet];
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
