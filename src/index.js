'use strict';

import { version, author, homepage, license } from '../package.json';
import { partial } from './U';

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
  about: Object.freeze({ version, author, homepage, license }),
  Any,
  AsIs,
  Date: ModelicoDate,
  Enum,
  EnumMap,
  List,
  Map: ModelicoMap,
  Modelico,
  Set: ModelicoSet,
  proxyMap: partial(proxyFactory, mapNonMutatorMethods, mapMutatorMethods, 'innerMap'),
  proxyList: partial(proxyFactory, listNonMutatorMethods, listMutatorMethods, 'innerList'),
  proxySet: partial(proxyFactory, setNonMutatorMethods, setMutatorMethods, 'innerSet'),
  proxyDate: partial(proxyFactory, dateNonMutatorMethods, dateMutatorMethods, 'date')
});
