'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class AbstractMap extends Modelico {
  constructor(Type, keyMetadata, valueMetadata, map) {
    super(Type, {map});

    this.innerTypes = () => Object.freeze({keyMetadata, valueMetadata});
    this.map = () => (map === null) ? null : new Map(map);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return value;
    }

    const item = this.map().get(path[0]);
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.map();
    newMap.set(key, value);

    return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  static metadata(Type, reviver, keyMetadata, valueMetadata) {
    return Object.freeze({type: Type, reviver: U.bind(reviver, {keyMetadata, valueMetadata})});
  }
}

module.exports = Object.freeze(AbstractMap);
