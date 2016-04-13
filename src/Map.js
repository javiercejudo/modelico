'use strict';

const U = require('./U');
const Modelico = require('./Modelico');
const AsIs = require('./AsIs');

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

class ModelicoMap extends Modelico {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoMap, {map});

    this.innerTypes = () => Object.freeze({keyMetadata, valueMetadata});
    this.map = () => (map === null) ? null : new Map(map);

    Object.freeze(this);
  }

  set(key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.map();
    newMap.set(key, value);

    return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
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
    return (fields.map === null) ? null : Array.from(fields.map).map(stringifyMapper);
  }

  static fromObject(obj) {
    return ModelicoMap.fromMap(new Map(U.objToArr(obj)));
  }

  static fromMap(map) {
    return new ModelicoMap(AsIs(String), AsIs(), map);
  }

  static metadata(keyMetadata, valueMetadata) {
    return Object.freeze({type: ModelicoMap, reviver: U.bind(reviver, {keyMetadata, valueMetadata})});
  }
}

module.exports = Object.freeze(ModelicoMap);
