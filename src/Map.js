'use strict';

import { objToArr, reviverOrAsIs } from './U';
import AbstractMap from './AbstractMap';
import AsIs from './AsIs';
import Any from './Any';

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = (keyMetadata, valueMetadata) => pairObject => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', pairObject.key);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', pairObject.value);

  return [key, val];
};

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ?
    null :
    new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

  return new ModelicoMap(innerMap);
};

class ModelicoMap extends AbstractMap {
  constructor(innerMap) {
    super(ModelicoMap, innerMap);

    Object.freeze(this);
  }

  set(key, value) {
    return AbstractMap.set.call(this, ModelicoMap, key, value);
  }

  toJSON() {
    return [...this.inner()].map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoMap, reviverFactory(keyMetadata, valueMetadata));
  }
}

export default Object.freeze(ModelicoMap);
