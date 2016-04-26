'use strict';

const U = require('./U');
const Modelico = require('./Modelico');

class AbstractMap extends Modelico {
  constructor(Type, keyMetadata, valueMetadata, innerMap) {
    super(Type, {innerMap});

    this.innerTypes = U.always(Object.freeze({keyMetadata, valueMetadata}));
    this.innerMap = () => (innerMap === null) ? null : new Map(innerMap);

    return this;
  }

  [Symbol.iterator]() {
    return this.innerMap()[Symbol.iterator]();
  }

  setPath(path, value) {
    if (path.length === 0) {
      const innerTypes = this.innerTypes();

      return new (this.type())(innerTypes.keyMetadata, innerTypes.keyMetadata, value);
    }

    const item = this.innerMap().get(path[0]);
    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.innerMap();
    newMap.set(key, value);

    return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  static metadata(Type, reviver, keyMetadata, valueMetadata) {
    return Object.freeze({type: Type, reviver: U.bind(reviver, {keyMetadata, valueMetadata})});
  }
}

module.exports = Object.freeze(AbstractMap);
