'use strict';

import { always, isNothing } from './U';
import Base from './Base';

const reviverFactory = itemMetadata => ((k, v) => {
  if (k !== '') {
    return v;
  }

  const maybeValue = (v === null) ? null : itemMetadata.reviver(k, v);

  return new Maybe(maybeValue);
});

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

class Maybe extends Base {
  constructor(v) {
    super(Maybe, {});

    const inner = (isNothing(v)) ? nothing : new Just(v);
    this.inner = always(inner);

    Object.freeze(this);
  }

  set(field, v) {
    if (this.isEmpty()) {
      return new Maybe(null);
    }

    const item = this.inner().get();

    return new Maybe(item.set(field, v));
  }

  setPath(path, v) {
    if (path.length === 0) {
      return new Maybe(v);
    }

    if (this.isEmpty()) {
      return new Maybe(null);
    }

    const item = this.inner().get();
    const inner = (item.setPath) ? item.setPath(path, v) : null;

    return new Maybe(inner);
  }

  isEmpty() {
    return (this.inner() === nothing);
  }

  getOrElse(v) {
    return this.isEmpty() ? v : this.inner().get();
  }

  map(f) {
    const v = this.isEmpty() ? null : f(this.inner().get());

    return new Maybe(v);
  }

  toJSON() {
    return this.inner().toJSON();
  }

  static of(v) {
    return new Maybe(v);
  }

  static metadata(itemMetadata) {
    return Object.freeze({type: Maybe, reviver: reviverFactory(itemMetadata)});
  }
}

export default Object.freeze(Maybe);
