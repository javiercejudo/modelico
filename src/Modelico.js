'use strict';

const U = require('./U');

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

class Modelico {
  constructor(Type, fields) {
    this.type = () => Type;
    this.fields = () => Object.freeze(fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field] = () => fields[field]);
  }

  set(field, value) {
    const newFields = Object.assign({}, this.clone().fields(), assignReducer({}, {field, value}));
    const Type = this.type();

    return new Type(newFields);
  }

  clone() {
    return Modelico.fromJSON(this.type(), JSON.stringify(this));
  }

  equals(other) {
    return (JSON.stringify(this) === JSON.stringify(other));
  }

  toJSON() {
    return this.fields();
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
