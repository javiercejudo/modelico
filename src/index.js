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

const bind3 = (fn, _1, _2, _3) => fn.bind(undefined, _1, _2, _3);
const proxyFactory = require('./proxyFactory');
const internalNonMutators = ['set', 'setPath'];

const mapNonMutatorMethods = internalNonMutators;
const mapMutatorMethods = require('../data/mapMutators.json');

const setNonMutatorMethods = internalNonMutators;
const setMutatorMethods = require('../data/setMutators.json');

const listNonMutatorMethods = internalNonMutators.concat(require('../data/listNonMutators.json'));
const listMutatorMethods = require('../data/listMutators.json');

const dateNonMutatorMethods = internalNonMutators;
const dateMutatorMethods = require('../data/dateMutators.json');

module.exports = Object.freeze({
  Any,
  AsIs,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  Modelico,
  Set: ModelicoSet,
  proxyMap: bind3(proxyFactory, mapNonMutatorMethods, mapMutatorMethods, 'innerMap'),
  proxyList: bind3(proxyFactory, listNonMutatorMethods, listMutatorMethods, 'innerList'),
  proxySet: bind3(proxyFactory, setNonMutatorMethods, setMutatorMethods, 'innerSet'),
  proxyDate: bind3(proxyFactory, dateNonMutatorMethods, dateMutatorMethods, 'date')
});
