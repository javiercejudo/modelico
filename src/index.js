'use strict';

const Modelico = require('./Modelico');
const ModelicoMap = require('./Map');
const EnumMap = require('./EnumMap');
const ModelicoDate = require('./Date');
const AsIs = require('./AsIs');
const List = require('./List');
const ModelicoSet = require('./Set');
const Enum = require('./Enum');
const Any = require('./Any');
const U = require('./U');

module.exports = Object.freeze({
  Modelico,
  Map: ModelicoMap,
  EnumMap,
  Date: ModelicoDate,
  AsIs,
  Any,
  List,
  Set: ModelicoSet,
  Enum,
  proxyMap: U.bind(U.proxyToInner, 'innerMap'),
  proxyList: U.bind(U.proxyToInner, 'innerList'),
  proxySet: U.bind(U.proxyToInner, 'innerSet'),
  proxyDate: U.bind(U.proxyToInner, 'date')
});
