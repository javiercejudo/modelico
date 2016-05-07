'use strict';

import { always } from './U';
import Modelico from './Modelico';

class AbstractMap extends Modelico {
  constructor(Type, keyMetadata, valueMetadata, innerMap) {
    super(Type, {innerMap});

    this.innerTypes = always(Object.freeze({keyMetadata, valueMetadata}));
    this.innerMap = () => (innerMap === null) ? null : new Map(innerMap);
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();

    return this;
  }

  setPath(path, value) {
    if (path.length === 0) {
      const innerTypes = this.innerTypes();

      return new (this.type())(innerTypes.keyMetadata, innerTypes.keyMetadata, value);
    }

    const item = this.innerMap().get(path[0]);

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const innerTypes = this.innerTypes();
    const newMap = this.innerMap();
    newMap.set(key, value);

    return new Type(innerTypes.keyMetadata, innerTypes.valueMetadata, newMap);
  }

  static metadata(Type, reviverFactory, keyMetadata, valueMetadata) {
    return Object.freeze({type: Type, reviver: reviverFactory({keyMetadata, valueMetadata})});
  }
}

export default Object.freeze(AbstractMap);
