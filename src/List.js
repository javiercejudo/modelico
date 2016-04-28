'use strict';

import U from './U';
import Modelico from './Modelico';
import AsIs from './AsIs';
import Any from './Any';

class ModelicoList extends Modelico {
  constructor(itemMetadata, innerList) {
    super(ModelicoList, {innerList});

    this.itemMetadata = U.always(itemMetadata);
    this.innerList = () => (innerList === null) ? null : innerList.slice();
    this[Symbol.iterator] = () => innerList[Symbol.iterator]();

    return Object.freeze(this);
  }

  set(index, value) {
    const newList = this.innerList();
    newList[index] = value;

    return new ModelicoList(this.itemMetadata(), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new ModelicoList(this.itemMetadata(), value);
    }

    const item = this.innerList()[path[0]];

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this.fields().innerList;
  }

  static fromArray(arr) {
    return new ModelicoList(AsIs(Any), arr);
  }

  static metadata(itemMetadata) {
    return U.iterableMetadata(ModelicoList, itemMetadata);
  }
}

export default Object.freeze(ModelicoList);
