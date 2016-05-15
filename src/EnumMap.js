'use strict';

import { reviverOrAsIs, pipe, partial } from './U';
import { checkNull } from './checks';
import AbstractMap from './AbstractMap';

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
};

const parseMapper = (keyMetadata, valueMetadata, object) => (enumerator, index) => {
  const keyCheckNull = checkNull('EnumMap', keyMetadata, `keys[${index}]`);
  const reviveKey = partial(reviverOrAsIs(keyMetadata), '');
  const key = pipe(keyCheckNull, reviveKey)(enumerator);

  const valCheckNull = checkNull('EnumMap', valueMetadata, `values[${index}]`);
  const reviveVal = partial(reviverOrAsIs(valueMetadata), '');
  const val = pipe(valCheckNull, reviveVal)(object[enumerator]);

  return [key, val];
};

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(Object.keys(v).map(parseMapper(keyMetadata, valueMetadata, v)));

  return new ModelicoEnumMap(keyMetadata, valueMetadata, innerMap);
};

class ModelicoEnumMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, innerMap) {
    super(ModelicoEnumMap, keyMetadata, valueMetadata, innerMap);

    return Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoEnumMap, enumerator, value);
  }

  toJSON() {
    const innerMap = this.fields().innerMap;

    return (innerMap === null) ? null : [...innerMap].reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return ModelicoEnumMap.metadataWithOptions({}, keyMetadata, valueMetadata);
  }

  static metadataWithOptions(options, keyMetadata, valueMetadata) {
    return AbstractMap.metadataWithOptions(options, ModelicoEnumMap, reviverFactory, keyMetadata, valueMetadata);
  }
}

export default Object.freeze(ModelicoEnumMap);
