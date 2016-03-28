/*jshint node:true, esnext:true */

'use strict';

const Enum = require('./Enum');

module.exports = function(values) {
  let valuesAsObject = values;

  if (Array.isArray(values)) {
    valuesAsObject = values.reduce((acc, code) => {
      acc[code] = {code};

      return acc;
    }, {});
  }

  const myEnum = new Enum(valuesAsObject);
  myEnum.reviver = Enum.reviver.bind(undefined, valuesAsObject);

  return myEnum;
};
