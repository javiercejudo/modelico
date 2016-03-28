/*jshint node:true, esnext:true */

'use strict';

const Enum = require('./Enum');

const valuesReducer = (acc, code) => {
  acc[code] = {code};

  return acc;
};

module.exports = values => {
  const valuesAsObject = Array.isArray(values) ?
    values.reduce(valuesReducer, {}) :
    values;

  const myEnum = new Enum(valuesAsObject);
  myEnum.reviver = Enum.reviver.bind(undefined, valuesAsObject);

  return myEnum;
};
