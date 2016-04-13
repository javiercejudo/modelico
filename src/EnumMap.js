'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1];

  return acc;
}

const parseMapper = (innerTypes, object) => (enumerator) => [
  U.reviverOrAsIs(innerTypes.enumMetadata)('', enumerator),
  U.reviverOrAsIs(innerTypes.valueMetadata)('', object[enumerator])
];

const reviver = (innerTypes, k, v) => {
  if (k !== '') {
    return v;
  }

  const map = (v === null) ? null : new Map(Object.keys(v).map(parseMapper(innerTypes, v)));

  return new ModelicoEnumMap(innerTypes.enumMetadata, innerTypes.valueMetadata, map);
}

class ModelicoEnumMap extends Modelico {
  constructor(enumMetadata, valueMetadata, map) {
    super(ModelicoEnumMap, {map});

    this.innerTypes = () => Object.freeze({enumMetadata, valueMetadata});
    this.map = () => (map === null) ? null : new Map(map);

    Object.freeze(this);
  }

  set(enumerator, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.map();
    newMap.set(enumerator, value);

    return new ModelicoEnumMap(innerTypes.enumMetadata, innerTypes.valueMetadata, newMap);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return value;
    }

    const item = this.map().get(path[0]);
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  toJSON() {
    const fields = this.fields();
    return (fields.map === null) ? null : Array.from(fields.map).reduce(stringifyReducer, {});
  }

  static metadata(enumMetadata, valueMetadata) {
    return Object.freeze({type: ModelicoEnumMap, reviver: U.bind(reviver, {enumMetadata, valueMetadata})});
  }
}

module.exports = Object.freeze(ModelicoEnumMap);
