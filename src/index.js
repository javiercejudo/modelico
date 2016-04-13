'use strict';

const Modelico = require('./Modelico');
const ModelicoMap = require('./Map');
const EnumMap = require('./EnumMap');
const ModelicoDate = require('./Date');
const AsIs = require('./AsIs');
const List = require('./List');
const Enum = require('./Enum');
const Any = require('./Any');

module.exports = Object.freeze({
  Modelico,
  Map: ModelicoMap,
  EnumMap,
  Date: ModelicoDate,
  AsIs,
  Any,
  List,
  Enum
});
