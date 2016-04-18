'use strict';

const U = require('./U');
const Modelico = require('./Modelico');
const AsIs = require('./AsIs');
const Any = require('./Any');

class ModelicoSet extends Modelico {
  constructor(itemMetadata, innerSet) {
    super(ModelicoSet, {innerSet});

    this.itemMetadata = () => itemMetadata;
    this.innerSet = () => (innerSet === null) ? null : new Set(innerSet);

    return Object.freeze(this);
  }

  set(index, value) {
    const newSet = Array.from(this.innerSet());
    newSet[index] = value;

    return new ModelicoSet(this.itemMetadata(), newSet);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return value;
    }

    const item = Array.from(this.innerSet())[path[0]];

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const innerSet = this.fields().innerSet;

    return (innerSet === null) ? null : Array.from(innerSet);
  }

  static fromArray(arr) {
    return new ModelicoSet(AsIs(Any), arr);
  }

  static fromSet(arr) {
    return new ModelicoSet(AsIs(Any), arr);
  }

  static metadata(itemMetadata) {
    return U.iterableMetadata(ModelicoSet, itemMetadata);
  }
}

module.exports = Object.freeze(ModelicoSet);
