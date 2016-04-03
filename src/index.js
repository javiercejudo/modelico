/*jshint node:true, esnext: true */

'use strict';

const Modelico = require('./Modelico');
const ModelicoMap = require('./Map');
const ModelicoDate = require('./Date');
const AsIs = require('./AsIs');
const List = require('./List');
const Enum = require('./Enum');
const enumFactory = require('./enumFactory');

module.exports = {
  Modelico,
  Map: ModelicoMap,
  Date: ModelicoDate,
  AsIs,
  List,
  Enum,
  enumFactory
};
