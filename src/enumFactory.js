/*jshint node:true, esnext:true */

'use strict';

const Enum = require('./Enum');

module.exports = function(values) {
  let valuesAsObject = values;

  if (Array.isArray(values)) {
    valuesAsObject = values.reduce((acc, value) => {
      acc[value] = {code: value};

      return acc;
    }, {});
  }

  const myEnum = new Enum(valuesAsObject);
  myEnum.reviver = Enum.buildReviver(valuesAsObject);

  return myEnum;
};
