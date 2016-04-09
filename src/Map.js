'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});
const identityReviver = (k, v) => v;
const reviverOrDefault = metadata => (metadata.reviver || identityReviver);

const parseMapper = subtypes => pairObject => [
  reviverOrDefault(subtypes.keyMetadata)('', pairObject.key),
  reviverOrDefault(subtypes.valueMetadata)('', pairObject.value)
];

class ModelicoMap extends Modelico {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoMap, {map});

    this.innerTypes = () => Object.freeze({keyMetadata, valueMetadata});

    Object.freeze(this);
  }

  set(key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.clone().map();
    newMap.set(key, value);

    return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  setPath(path, value) {
    const item = this.map().get(path[0]);
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  clone() {
    return JSON.parse(JSON.stringify(this), U.bind(ModelicoMap.reviver, this.innerTypes()));
  }

  toJSON() {
    return (this.map() === null) ? null : Array.from(this.map()).map(stringifyMapper);
  }

  static buildReviver(keyMetadata, valueMetadata) {
    return U.bind(ModelicoMap.reviver, {keyMetadata, valueMetadata});
  }

  static reviver(innerTypes, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.map(parseMapper(innerTypes)));

      return new ModelicoMap(innerTypes.keyMetadata, innerTypes.valueMetadata, map);
    }

    return v;
  }

  static metadata(keyMetadata, valueMetadata) {
    return Object.freeze({type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata)});
  }
}

module.exports = Object.freeze(ModelicoMap);
