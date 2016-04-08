'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class ModelicoList extends Modelico {
  constructor(itemMetadata, list) {
    super(ModelicoList, {list});

    this.itemMetadata = () => itemMetadata;
    this.list = () => list === null ? null : list.slice();

    Object.freeze(this);
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoList.buildReviver(this.itemMetadata()));
  }

  toJSON() {
    return this.list();
  }

  static buildReviver(itemMetadata) {
    return U.bind(ModelicoList.reviver, itemMetadata);
  }

  static reviver(itemMetadata, k, v) {
    if (k === '') {
      const list = (v === null) ? null : v.map(U.bind(itemMetadata.reviver, k));

      return new ModelicoList(itemMetadata, list);
    }

    return v;
  }

  static metadata(subtypeMetadata) {
    return Object.freeze({type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata)});
  }
}

module.exports = Object.freeze(ModelicoList);
