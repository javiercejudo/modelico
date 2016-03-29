/*jshint node:true, esnext: true */

'use strict';

const Modelico = require('./src/Modelico');
const ModelicoMap = require('./src/Map');
const ModelicoEnum = require('./src/Enum');
const ModelicoDate = require('./src/Date');
const enumFactory = require('./src/enumFactory');

module.exports = {
  Modelico,
  ModelicoMap,
  ModelicoDate,
  ModelicoEnum,
  enumFactory
};
