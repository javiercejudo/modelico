/*jshint node:true, esnext:true */

'use strict';

class Modelico {
  constructor(Type, fields) {
    this.type = () => Type;

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field] = fields[field]);
  }

  clone() {
    return Modelico.fromJSON(this.type(), JSON.stringify(this));
  }

  equals(other) {
    return (JSON.stringify(this) === JSON.stringify(other));
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
      return new Type(v);
    }

    if (Type.metadata && Type.metadata[k]) {
      return Type.metadata[k].reviver('', v);
    }

    return v;
  }
}

module.exports = Modelico;
