'use strict';

import { always, defaultTo, reviverOrAsIs, isPlainObject, isNothing, getInnerTypes } from './U';
import { typeSymbol, fieldsSymbol } from './symbols';

import Maybe from './Maybe';

class Base {
  constructor(Type, fields, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.name} but got ${fields}`);
    }

    Object.freeze(fields);

    const innerTypes = getInnerTypes(Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(fields);

    new Set([...Object.keys(innerTypes), ...Object.keys(fields)])
      .forEach(key => {
        const valueCandidate = fields[key];
        const innerType = innerTypes[key];
        let value = valueCandidate;

        if (isNothing(valueCandidate) && innerType) {
          if (innerType.type !== Maybe) {
            throw TypeError(`no value for key ${key}`);
          }

          value = Maybe.of(null);
        }

        thisArg[key] = always(value)
      });
  }

  set(field, value) {
    const newFields = Object.assign({}, this[fieldsSymbol](), {[field]: value});

    return new (this[typeSymbol]())(newFields);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value);
    }

    const item = this[path[0]]();

    if (!item.setPath) {
      return this.set(path[0], value);
    }

    return this.set(path[0], item.setPath(path.slice(1), value));
  }

  equals(other) {
    return (JSON.stringify(this) === JSON.stringify(other));
  }

  toJSON() {
    return this[fieldsSymbol]();
  }

  static factory(Type, fields, thisArg) {
    return new Base(Type, fields, thisArg);
  }
}

export default Object.freeze(Base);
