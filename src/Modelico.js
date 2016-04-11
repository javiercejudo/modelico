'use strict';

import U from './U';

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

const reviver = (Type, k, v) => {
  if (k === '') {
    return new Type(v);
  }

  if (Type.innerTypes) {
    const innerTypeMetadata = Type.innerTypes()[k];

    if (innerTypeMetadata) {
      return U.reviverOrAsIs(innerTypeMetadata)('', v);
    }
  }

  return v;
};

class Modelico {
  constructor(Type, fields, thisArg) {
    thisArg = U.default(thisArg, this);
    thisArg.type = U.always(Type);
    thisArg.fields = U.always(Object.freeze(fields));

    Object.getOwnPropertyNames(fields)
      .forEach(field => thisArg[field] = U.always(fields[field]));

    return thisArg;
  }

  set(field, value) {
    const newFields = Object.assign({}, this.fields(), assignReducer({}, {field, value}));

    return new (this.type())(newFields);
  }

  setPath(path, value) {
    if (path.length === 0) {
      return new (this.type())(value);
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
    return this.fields();
  }

  static factory(Type, fields, thisArg) {
    return new Modelico(Type, fields, thisArg);
  }

  static fromJSON(Type, json) {
    return JSON.parse(json, U.bind(reviver, Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: U.bind(reviver, Type)});
  }
}

export default Object.freeze(Modelico);
