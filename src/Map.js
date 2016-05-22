'use strict';

import { objToArr, reviverOrAsIs, pipe, partial } from './U';
import { checkNull } from './checks';
import AbstractMap from './AbstractMap';
import AsIs from './AsIs';
import Any from './Any';

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = (keyMetadata, valueMetadata) => (pairObject, index) => {
  const keyCheckNull = checkNull('Map', keyMetadata, `keys[${index}]`);
  const reviveKey = partial(reviverOrAsIs(keyMetadata), '');
  const key = pipe(keyCheckNull, reviveKey)(pairObject.key);

  const valCheckNull = checkNull('Map', valueMetadata, `values[${index}]`);
  const reviveVal = partial(reviverOrAsIs(valueMetadata), '');
  const val = pipe(valCheckNull, reviveVal)(pairObject.value);

  return [key, val];
};

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(v.map(parseMapper(keyMetadata, valueMetadata)));

  return new ModelicoMap(keyMetadata, valueMetadata, innerMap);
};

class ModelicoMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, innerMap) {
    super(ModelicoMap, keyMetadata, valueMetadata, innerMap);

    return Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoMap, enumerator, value);
  }

  toJSON() {
    const innerMap = this.fields().innerMap;

    return (innerMap === null) ? null : [...innerMap].map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(AsIs(String), AsIs(Any), map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return ModelicoMap.metadataWithOptions({}, keyMetadata, valueMetadata);
  }

  static metadataWithOptions(options, keyMetadata, valueMetadata) {
    return AbstractMap.metadataWithOptions(options, ModelicoMap, reviverFactory, keyMetadata, valueMetadata);
  }
}

export default Object.freeze(ModelicoMap);
