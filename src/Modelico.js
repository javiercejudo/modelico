'use strict';

import U from './U';

const assignReducer = (acc, pair) => {
  acc[pair.field] = pair.value;

  return acc;
};

const mergeDeepInnerTypes = (acc, Type) => {
  if (!Type.innerTypes) {
    return acc;
  }

  const innerTypes = Type.innerTypes();

  const result = Object.keys(innerTypes).reduce((localAcc, key) => {
    localAcc = mergeDeepInnerTypes(acc, innerTypes[key].type);

    if (localAcc.hasOwnProperty(key) && acc[key].type.name !== innerTypes[key].type.name) {
      throw new TypeError(`Duplicated typed key '${key}' with types ${acc[key].type.name} and ${innerTypes[key].type.name}`);
    }

    localAcc[key] = innerTypes[key];

    return localAcc;
  }, {});

  // console.log(result);

  return result;
};

const reviverFactory = Type => {
  const innerTypes = mergeDeepInnerTypes({}, Type);

  return (k, v) => {
    if (k === '') {
      return new Type(v);
    }

    const innerTypeMetadata = innerTypes[k];

    if (innerTypeMetadata) {
      return U.reviverOrAsIs(innerTypeMetadata)('', v);
    }

    return v;
  };
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
    return JSON.parse(json, reviverFactory(Type));
  }

  static metadata(Type) {
    return Object.freeze({type: Type, reviver: reviverFactory(Type)});
  }
}

export default Object.freeze(Modelico);
