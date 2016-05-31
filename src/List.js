'use strict';

import { always } from './U';
import { fieldsSymbol, innerSymbol, itemMetadataSymbol } from './symbols';
import { iterableMetadata } from './iterable';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoList extends Modelico {
  constructor(itemMetadata, innerList) {
    super(ModelicoList, {innerList});

    this[itemMetadataSymbol] = always(itemMetadata);
    this[innerSymbol] = () => (innerList === null) ? null : innerList.slice();
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newList = this[innerSymbol]();
    newList[index] = value;

    return new ModelicoList(this[itemMetadataSymbol](), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(this[itemMetadataSymbol](), value);
    }

    const item = this[innerSymbol]()[path[0]];

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this[fieldsSymbol]().innerList;
  }

  static fromArray(arr) {
    return new ModelicoList(AsIs(Any), arr);
  }

  static metadata(itemMetadata) {
    return iterableMetadata(ModelicoList, itemMetadata);
  }
}

export default Object.freeze(ModelicoList);
