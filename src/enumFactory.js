/*jshint node:true, esnext:true */

'use strict';

const ModelicoEnum = require('./Enum');

const valuesReducer = (acc, code) => (acc[code] = {code}) && acc;

module.exports = values => {
  const valuesAsObject = Array.isArray(values) ?
    values.reduce(valuesReducer, {}) :
    values;

  const myEnum = new ModelicoEnum(valuesAsObject);

  myEnum.reviver = ModelicoEnum.buildReviver(valuesAsObject);
  myEnum.metadata = () => Object.freeze({type: ModelicoEnum, reviver: myEnum.reviver});

  return Object.freeze(myEnum);
};
