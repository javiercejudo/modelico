'use strict';

import { reviverOrAsIs } from './U';
import AbstractMap from './AbstractMap';

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

const parseMapper = (keyMetadata, valueMetadata, object) => enumerator => {
  const reviveKey = reviverOrAsIs(keyMetadata);
  const key = reviveKey('', enumerator);

  const reviveVal = reviverOrAsIs(valueMetadata);
  const val = reviveVal('', object[enumerator]);

  return [key, val];
};

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ?
    null :
    new Map(Object.keys(v).map(parseMapper(keyMetadata, valueMetadata, v)));

  return new ModelicoEnumMap(innerMap);
};

class ModelicoEnumMap extends AbstractMap {
  constructor(innerMap) {
    super(ModelicoEnumMap, innerMap);

    Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoEnumMap, enumerator, value);
  }

  toJSON() {
    return [...this.inner()].reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoEnumMap, reviverFactory(keyMetadata, valueMetadata));
  }
}

export default Object.freeze(ModelicoEnumMap);
