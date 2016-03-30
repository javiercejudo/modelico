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
