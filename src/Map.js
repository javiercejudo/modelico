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

    this.subtypes = () => Object.freeze({keyMetadata, valueMetadata});

    Object.freeze(this);
  }

  clone() {
    return JSON.parse(JSON.stringify(this), U.bind(ModelicoMap.reviver, this.subtypes()));
  }

  toJSON() {
    return (this.map() === null) ? null : Array.from(this.map()).map(stringifyMapper);
  }

  static buildReviver(keyMetadata, valueMetadata) {
    return U.bind(ModelicoMap.reviver, {keyMetadata, valueMetadata});
  }

  static reviver(subtypes, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.map(parseMapper(subtypes)));

      return new ModelicoMap(subtypes.keyMetadata, subtypes.valueMetadata, map);
    }

    return v;
  }

  static metadata(keyMetadata, valueMetadata) {
    return Object.freeze({type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata)});
  }
}

module.exports = Object.freeze(ModelicoMap);
