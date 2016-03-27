/*jshint node:true, esnext:true */

'use strict';

class Modelico {
  constructor(Type, fields) {
    this.Type = Type;

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field] = fields[field]);
  }

  clone() {
    return Modelico.fromJSON(this.Type, JSON.stringify(this));
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

    if (Type.types && Type.types[k] && 'reviver' in Type.types[k]) {
      return Modelico.buildReviver(Type.types[k])('', v);
    }

    return v;
  }
}

module.exports = Modelico;
