'use strict';

import { always, defaultTo, reviverOrAsIs } from './U';

const reviverFactory = Type => {
  const innerTypes = Type.innerTypes && Type.innerTypes() || {};

  return (k, v) => {
    if (k !== '') {
      return v;
    }

    const fields = Object.keys(v).reduce((acc, field) => {
      const innerTypeMetadata = innerTypes[field];

      acc[field] = innerTypeMetadata ?
        reviverOrAsIs(innerTypeMetadata)('', v[field]) :
        acc[field] = v[field];

      return acc;
    }, {});

    return new Type(fields);
  };
};

class Modelico {
  constructor(Type, fields, thisArg) {
    thisArg = defaultTo(this, thisArg);
    thisArg.type = always(Type);
    thisArg.fields = always(Object.freeze(fields));

    Object.getOwnPropertyNames(fields)
      .forEach(field => thisArg[field] = always(fields[field]));

    return thisArg;
  }

  set(field, value) {
    const newFields = Object.assign({}, this.fields(), {[field]: value});

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
    return JSON.parse(json, reviverFactory(Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: reviverFactory(Type)});
  }
}

export default Object.freeze(Modelico);
