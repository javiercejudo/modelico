'use strict';

import { always, defaultTo, reviverOrAsIs, isPlainObject, isNothing } from './U';
import { typeSymbol, fieldsSymbol } from './symbols';

import Maybe from './Maybe';

const getInnerTypes = Type => Type.innerTypes && Type.innerTypes() || {};

const reviverFactory = Type => {
  const innerTypes = getInnerTypes(Type);

  return (k, v) => {
    if (k !== '') {
      return v;
    }

    const fields = !isPlainObject(v) ? v : Object.keys(v).reduce((acc, field) => {
      const metadata = innerTypes[field];

      if (metadata) {
        acc[field] = reviverOrAsIs(metadata)(k, v[field]);
      } else {
        acc[field] = v[field];
      }

      return acc;
    }, {});

    return new Type(fields);
  };
};

class Modelico {
  constructor(Type, fields, thisArg) {
    if (!isPlainObject(fields)) {
      throw TypeError(`expected an object with fields for ${Type.name} but got ${fields}`);
    }

    const innerTypes = getInnerTypes(Type);

    thisArg = defaultTo(this)(thisArg);
    thisArg[typeSymbol] = always(Type);
    thisArg[fieldsSymbol] = always(Object.freeze(fields));

    new Set([...Object.keys(innerTypes), ...Object.keys(fields)])
      .forEach(key => {
        const value = fields[key];
        const innerType = innerTypes[key];

        if (isNothing(value) && innerType && innerType.type !== Maybe) {
          throw TypeError(`no value for key ${key}`);
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

    if (path.length === 1) {
      return this.set(path[0], value);
    }

    return this.set(path[0], this[path[0]]().setPath(path.slice(1), value));
  }

  equals(other) {
    return (JSON.stringify(this) === JSON.stringify(other));
  }

  toJSON() {
    return this[fieldsSymbol]();
  }

  static factory(Type, fields, thisArg) {
    return new Modelico(Type, fields, thisArg);
  }

  static fromJSON(Type, json) {
    return JSON.parse(json, reviverFactory(Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: reviverFactory(Type)});
  }
}

export default Object.freeze(Modelico);
