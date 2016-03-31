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
