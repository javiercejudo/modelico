'use strict';

import { always, isNothing } from './U';
import { typeSymbol } from './symbols';
import Modelico from './Modelico';

class AbstractMap extends Modelico {
  constructor(Type, innerMapOrig) {
    super(Type, {});

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map');
    }

    const innerMap = new Map(innerMapOrig);

    this.inner = () => new Map(innerMap);
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]();
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value);
    }

    const item = this.inner().get(path[0]);

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  // as static to support IE < 11
  static set(Type, key, value) {
    const newMap = this.inner();
    newMap.set(key, value);

    return new Type(newMap);
  }

  static metadata(Type, reviver) {
    return Object.freeze({type: Type, reviver});
  }
}

export default Object.freeze(AbstractMap);
