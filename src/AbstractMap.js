'use strict';

import { always, isNothing } from './U';
import { typeSymbol, innerTypesSymbol } from './symbols';
import Modelico from './Modelico';

class AbstractMap extends Modelico {
  constructor(Type, keyMetadata, valueMetadata, innerMap) {
    super(Type, {});

    if (isNothing(innerMap)) {
      throw TypeError('missing map');
    }

    this.inner = () => new Map(innerMap);
    this[innerTypesSymbol] = always(Object.freeze({keyMetadata, valueMetadata}));
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();
  }

  setPath(path, value) {
    if (path.length === 0) {
      const { keyMetadata, valueMetadata } = this[innerTypesSymbol]();

      return new (this[typeSymbol]())(keyMetadata, valueMetadata, value);
    }

    const item = this.inner().get(path[0]);

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const { keyMetadata, valueMetadata } = this[innerTypesSymbol]();
    const newMap = this.inner();
    newMap.set(key, value);

    return new Type(keyMetadata, valueMetadata, newMap);
  }

  static metadata(Type, reviver) {
    return Object.freeze({type: Type, reviver});
  }
}

export default Object.freeze(AbstractMap);
