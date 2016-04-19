'use strict';

const U = require('./U');
const AbstractMap = require('./AbstractMap');

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
}

const parseMapper = (innerTypes, object) => (enumerator) => [
  U.reviverOrAsIs(innerTypes.keyMetadata)('', enumerator),
  U.reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])
];

const reviver = (innerTypes, k, v) => {
  if (k !== '') {
    return v;
  }

  const innerMap = (v === null) ? null : new Map(Object.keys(v).map(parseMapper(innerTypes, v)));

  return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, innerMap);
}

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

    return (innerMap === null) ? null : Array.from(innerMap).reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoEnumMap, reviver, keyMetadata, valueMetadata);
  }
}

module.exports = Object.freeze(ModelicoEnumMap);
