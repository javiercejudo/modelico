(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Modelico = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint node:true, esnext: true */

'use strict';

const Modelico = require('./src/Modelico');
const ModelicoPrimitive = require('./src/Primitive');
const ModelicoMap = require('./src/Map');
const ModelicoList = require('./src/List');
const ModelicoEnum = require('./src/Enum');
const ModelicoDate = require('./src/Date');
const enumFactory = require('./src/enumFactory');

module.exports = {
  Modelico,
  ModelicoPrimitive,
  ModelicoMap,
  ModelicoList,
  ModelicoDate,
  ModelicoEnum,
  enumFactory
};

},{"./src/Date":2,"./src/Enum":3,"./src/List":4,"./src/Map":5,"./src/Modelico":6,"./src/Primitive":7,"./src/enumFactory":8}],2:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoDate extends Modelico {
  constructor(date) {
    super(ModelicoDate, {date});

    this.date = () => date === null ? null : new Date(date.toISOString());
  }

  toJSON() {
    return (this.date() === null) ? null : this.date().toISOString();
  }

  static reviver(k, v) {
    const date = (v === null) ? null : new Date(v);

    return Object.freeze(new ModelicoDate(date));
  }

  static metadata() {
    return {type: ModelicoDate, reviver: ModelicoDate.reviver};
  }
}

module.exports = ModelicoDate;

},{"./Modelico":6}],3:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoEnum extends Modelico {
  constructor(fields) {
    super(ModelicoEnum, fields);

    Object.getOwnPropertyNames(fields)
      .forEach(field => this[field]().toJSON = () => field);
  }

  static reviver(values, k, v) {
    return (v === null) ? null : values[v];
  }
}

module.exports = ModelicoEnum;

},{"./Modelico":6}],4:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');
const ModelicoPrimitive = require('./Primitive');

class ModelicoList extends Modelico {
  constructor(subtypeMetadata, list) {
    super(ModelicoList, {list});

    this.subtype = () => subtypeMetadata;
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoList.buildReviver(this.subtype()));
  }

  toJSON() {
    return this.list();
  }

  static buildReviver(subtypeMetadata) {
    return ModelicoList.reviver.bind(undefined, subtypeMetadata);
  }

  static reviver(subtypeMetadata, k, v) {
    if (k === '') {
      const list = (v === null) ? null : v.map(subtypeMetadata.reviver.bind(undefined, ''));

      return Object.freeze(new ModelicoList(subtypeMetadata, list));
    }

    return v;
  }

  static metadata(subtypeMetadata) {
    return {type: ModelicoList, reviver: ModelicoList.buildReviver(subtypeMetadata)};
  }
}

module.exports = ModelicoList;

},{"./Modelico":6,"./Primitive":7}],5:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

const stringifyMapper = pair => ({key: pair[0], value: pair[1]});

const parseMapper = subtypes => pairObject => [
  subtypes.keyMetadata.reviver('', pairObject.key),
  subtypes.valueMetadata.reviver('', pairObject.value)
];

class ModelicoMap extends Modelico {
  constructor(keyMetadata, valueMetadata, map) {
    super(ModelicoMap, {map});

    this.subtypes = () => ({keyMetadata, valueMetadata});
  }

  clone() {
    return JSON.parse(JSON.stringify(this), ModelicoMap.reviver.bind(undefined, this.subtypes()));
  }

  toJSON() {
    return (this.map() === null) ? null : Array.from(this.map()).map(stringifyMapper);
  }

  static buildReviver(keyMetadata, valueMetadata) {
    return ModelicoMap.reviver.bind(undefined, {keyMetadata, valueMetadata});
  }

  static reviver(subtypes, k, v) {
    if (k === '') {
      const map = (v === null) ? null : new Map(v.map(parseMapper(subtypes)));

      return Object.freeze(new ModelicoMap(subtypes.keyMetadata, subtypes.valueMetadata, map));
    }

    return v;
  }

  static metadata(keyMetadata, valueMetadata) {
    return {type: ModelicoMap, reviver: ModelicoMap.buildReviver(keyMetadata, valueMetadata)};
  }
}

module.exports = ModelicoMap;

},{"./Modelico":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const Modelico = require('./Modelico');

class ModelicoPrimitive extends Modelico {
  static reviver(k, v) {
    return v;
  }

  static metadata(primitiveType) {
    return {type: primitiveType, reviver: ModelicoPrimitive.reviver};
  }
}

module.exports = ModelicoPrimitive;

},{"./Modelico":6}],8:[function(require,module,exports){
/*jshint node:true, esnext:true */

'use strict';

const ModelicoEnum = require('./Enum');

const valuesReducer = (acc, code) => (acc[code] = {code}) && acc;

module.exports = values => {
  const valuesAsObject = Array.isArray(values) ?
    values.reduce(valuesReducer, {}) :
    values;

  const myEnum = new ModelicoEnum(valuesAsObject);
  myEnum.reviver = ModelicoEnum.reviver.bind(undefined, valuesAsObject);
  myEnum.metadata = () => ({type: ModelicoEnum, reviver: myEnum.reviver});

  return Object.freeze(myEnum);
};

},{"./Enum":3}]},{},[1])(1)
});