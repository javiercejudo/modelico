/*jshint node:true, esnext:true */

'use strict';

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

class Modelico {
  constructor(Type, fields) {
    this.type = () => Type;
    this.fields = () => fields;

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field] = () => fields[field]);
  }

  set(field, value) {
    const fieldValue = assignReducer({}, {field, value});
    const newFields = Object.assign({}, this.clone().fields(), fieldValue);
    const newInstance = new Modelico(this.type(), newFields);

    return Object.freeze(newInstance);
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

    return Modelico.reviver.bind(undefined, Type);
  }

  static reviver(Type, k, v) {
    if (k === '') {
      return Object.freeze(new Type(v));
    }

    if (Type.metadata && Type.metadata[k]) {
      return Type.metadata[k].reviver('', v);
    }

    return v;
  }
}

module.exports = Modelico;
