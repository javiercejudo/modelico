'use strict';

import { always, defaultTo, reviverOrAsIs, pipe, partial } from './U';
import { checkRequired, checkStrict, checkNull } from './checks';

const reviverFactory = Type => {
  const innerTypes = Type.innerTypes && Type.innerTypes() || {};

  return (k, v) => {
    if (k !== '') {
      return v;
    }

    Object.keys(innerTypes)
      .forEach(field => checkRequired(Type.name, innerTypes[field], field)(v[field]));

    const fields = Object.keys(v).reduce((acc, field) => {
      const metadata = innerTypes[field];

      if (metadata) {
        acc[field] = pipe(
          checkStrict(Type.name, metadata, field),
          checkNull(Type.name, metadata, field),
          partial(reviverOrAsIs(metadata), k)
        )(v[field]);
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
    thisArg = defaultTo(this)(thisArg);
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
    return Modelico.metadataWithOptions({}, Type);
  }

  static metadataWithOptions(options, Type) {
    return Object.freeze({type: Type, reviver: reviverFactory(Type), options: options});
  }
}

export default Object.freeze(Modelico);
