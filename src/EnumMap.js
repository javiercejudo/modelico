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

  const map = (v === null) ? null : new Map(Object.keys(v).map(parseMapper(innerTypes, v)));

  return new ModelicoEnumMap(innerTypes.keyMetadata, innerTypes.valueMetadata, map);
}

class ModelicoEnumMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoEnumMap, keyMetadata, valueMetadata, map);
    Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoEnumMap, enumerator, value);
  }

  toJSON() {
    const fields = this.fields();
    return (fields.map === null) ? null : Array.from(fields.map).reduce(stringifyReducer, {});
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoEnumMap, reviver, keyMetadata, valueMetadata);
  }
}

module.exports = Object.freeze(ModelicoEnumMap);
