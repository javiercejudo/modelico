'use strict';

const U = require('./U');
const AbstractMap = require('./AbstractMap');
const AsIs = require('./AsIs');
const Any = require('./Any');

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = innerTypes => pairObject => [
  U.reviverOrAsIs(innerTypes.keyMetadata)('', pairObject.key),
  U.reviverOrAsIs(innerTypes.valueMetadata)('', pairObject.value)
];

const reviver = (innerTypes, k, v) => {
  if (k !== '') {
    return v;
  }

  const map = (v === null) ? null : new Map(v.map(parseMapper(innerTypes)));

  return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, map);
}

class ModelicoMap extends AbstractMap {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoMap, keyMetadata, valueMetadata, map);
    Object.freeze(this);
  }

  set(enumerator, value) {
    return AbstractMap.set.call(this, ModelicoMap, enumerator, value);
  }

  toJSON() {
    const fields = this.fields();

    return (fields.map === null) ? null : Array.from(fields.map).map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(U.objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(AsIs(String), AsIs(Any), map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return AbstractMap.metadata(ModelicoMap, reviver, keyMetadata, valueMetadata);
  }
}

module.exports = Object.freeze(ModelicoMap);
