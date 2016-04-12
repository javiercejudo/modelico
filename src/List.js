'use strict';

const U = require('./U');
const Modelico = require('./Modelico');
const AsIs = require('./AsIs').metadata;

const reviver = (itemMetadata, k, v) => {
  if (k === '') {
    const list = (v === null) ? null : v.map(U.bind(itemMetadata.reviver, k));

    return new ModelicoList(itemMetadata, list);
  }

  return v;
}

class ModelicoList extends Modelico {
  constructor(itemMetadata, list) {
    super(ModelicoList, {list});

    this.itemMetadata = () => itemMetadata;
    this.list = () => (list === null) ? null : list.slice();

    Object.freeze(this);
  }

  set(index, value) {
    const newList = this.list();
    newList[index] = value;

    return new ModelicoList(this.itemMetadata(), newList);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return value;
    }

    const item = this.list()[path[0]];
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    return this.fields().list;
  }

  static fromArray(arr) {
    return new ModelicoList(AsIs(), arr);
  }

  static metadata(itemMetadata) {
    return Object.freeze({type: ModelicoList, reviver: U.bind(reviver, itemMetadata)});
  }
}

module.exports = Object.freeze(ModelicoList);
