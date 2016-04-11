'use strict';

import Modelico from './Modelico';
import ModelicoMap from './Map';
import EnumMap from './EnumMap';
import ModelicoDate from './Date';
import AsIs from './AsIs';
import List from './List';
import ModelicoSet from './Set';
import Enum from './Enum';
import Any from './Any';
import proxyFactory from './proxyFactory';

const bind3 = (fn, _1, _2, _3) => fn.bind(undefined, _1, _2, _3);
const internalNonMutators = ['set', 'setPath'];

const mapNonMutatorMethods = internalNonMutators;
const mapMutatorMethods = [
  "set",
  "delete",
  "clear"
];

const setNonMutatorMethods = internalNonMutators;
const setMutatorMethods = [
  "add",
  "delete",
  "clear"
];

const listNonMutatorMethods = internalNonMutators.concat([
  "concat",
  "slice",
  "filter"
]);
const listMutatorMethods = [
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
];

const dateNonMutatorMethods = internalNonMutators;
const dateMutatorMethods = [
  "setDate",
  "setFullYear",
  "setHours",
  "setMinutes",
  "setMilliseconds",
  "setMonth",
  "setSeconds",
  "setTime",
  "setUTCDate",
  "setUTCFullYear",
  "setUTCHours",
  "setUTCMilliseconds",
  "setUTCMinutes",
  "setUTCMonth",
  "setUTCSeconds",
  "setYear"
];

export default Object.freeze({
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
