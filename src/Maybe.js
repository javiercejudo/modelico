'use strict';

import { always, isNothing } from './U';
import { itemMetadataSymbol } from './symbols';

import Modelico from './Modelico';

const reviverFactory = itemMetadata => (k, v) => {
  if (k !== '') {
    return v;
  }

  const maybeValue = (v === null) ? null : itemMetadata.reviver(k, v);

  return new Maybe(itemMetadata, maybeValue);
}

class Nothing {
  toJSON() {
    return null;
  }
}

export class Just {
  constructor(v) {
    this.get = always(v);

    Object.freeze(this);
  }

  toJSON() {
    const v = this.get();

    return (v.toJSON) ? v.toJSON() : v;
  }
}

export const nothing = new Nothing();

class Maybe extends Modelico {
  constructor(itemMetadata, v) {
    super(Maybe, {});

    this[itemMetadataSymbol] = always(itemMetadata);

    const inner = (isNothing(v)) ? nothing : new Just(v);
    this.inner = always(inner);

    Object.freeze(this);
  }

  set(field, v) {
    const itemMetadata = this[itemMetadataSymbol]();

    if (this.isEmpty()) {
      return new Maybe(itemMetadata, null);
    }

    const item = this.inner().get();

    return new Maybe(itemMetadata, item.set(field, v));
  }

  setPath(path, v) {
    const itemMetadata = this[itemMetadataSymbol]();

    if (path.length === 0) {
      return new Maybe(itemMetadata, v);
    }

    const inner = this.isEmpty() ? null : this.inner().get().setPath(path, v);

    return new Maybe(itemMetadata, inner);
  }

  isEmpty() {
    return (this.inner() === nothing);
  }

  getOrElse(v) {
    return this.isEmpty() ? v : this.inner().get();
  }

  map(itemMetadata, f) {
    const v = this.isEmpty() ? null : f(this.inner().get());

    return new Maybe(itemMetadata, v);
  }

  toJSON() {
    return this.inner().toJSON();
  }

  static metadata(itemMetadata) {
    return Object.freeze({type: Maybe, reviver: reviverFactory(itemMetadata)});
  }
}

export default Object.freeze(Maybe);
