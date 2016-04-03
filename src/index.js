'use strict';

const Modelico = require('./Modelico');
const ModelicoMap = require('./Map');
const ModelicoDate = require('./Date');
const AsIs = require('./AsIs');
const List = require('./List');
const Enum = require('./Enum');
const enumFactory = require('./enumFactory');

module.exports = Object.freeze({
  Modelico,
  Map: ModelicoMap,
  Date: ModelicoDate,
  AsIs,
  List,
  Enum,
  enumFactory
});
