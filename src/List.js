'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class ModelicoList extends Modelico {
  constructor(subtypeMetadata, list) {
    super(ModelicoList, {list});

    this.subtype = () => subtypeMetadata;

    Object.freeze(this);
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoList.buildReviver(this.subtype()));
  }

  toJSON() {
    return this.list();
  }

  static buildReviver(subtypeMetadata) {
    return U.bind(ModelicoList.reviver, subtypeMetadata);
  }

  static reviver(subtypeMetadata, k, v) {
    if (k === '') {
      const list = (v === null) ? null : v.map(U.bind(subtypeMetadata.reviver, k));

      return new ModelicoList(subtypeMetadata, list);
    }

    return v;
  }

  static metadata(subtypeMetadata) {
    return Object.freeze({type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata)});
  }
}

module.exports = Object.freeze(ModelicoList);
