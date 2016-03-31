/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');
const ModelicoPrimitive = require('./Primitive');

class ModelicoList extends Modelico {
  constructor(subtypeMetadata, list) {
    super(ModelicoList, {list});

    this.subtype = () => subtypeMetadata;
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoList.buildReviver(this.subtype()));
  }

  toJSON() {
    return this.list();
  }

  static buildReviver(subtypeMetadata) {
    return ModelicoList.reviver.bind(undefined, subtypeMetadata);
  }

  static reviver(subtypeMetadata, k, v) {
    if (k === '') {
      const list = (v === null) ? null : v.map(subtypeMetadata.reviver.bind(undefined, ''));

      return Object.freeze(new ModelicoList(subtypeMetadata, list));
    }

    return v;
  }

  static metadata(subtypeMetadata) {
    return {type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata)};
  }
}

module.exports = ModelicoList;
