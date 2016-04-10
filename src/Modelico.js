'use strict';

const U = require('./U');

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

class Modelico {
  constructor(Type, fields, thisArg) {
    thisArg = U.default(thisArg, this);
    thisArg.type = () => Type;
    thisArg.fields = () => Object.freeze(fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => thisArg[field] = () => fields[field]);
  }

  set(field, value) {
    const newFields = Object.assign({}, this.fields(), assignReducer({}, {field, value}));
    const Type = this.type();

    return new Type(newFields);
  }

  setPath(path, value) {
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
    return JSON.parse(json, Modelico.buildReviver(Type));
  }

  static buildReviver(Type) {
    if (Type.hasOwnProperty('reviver')) {
      return Type.reviver;
    }

    return U.bind(Modelico.reviver, Type);
  }

  static reviver(Type, k, v) {
    if (k === '') {
      return new Type(v);
    }

    if (Type.innerTypes) {
      const innerTypeMetadata = Type.innerTypes()[k];

      if (innerTypeMetadata) {
        return innerTypeMetadata.reviver('', v);
      }
    }

    return v;
  }
}

module.exports = Object.freeze(Modelico);
