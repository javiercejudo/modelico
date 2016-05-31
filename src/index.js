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

const mapNonMutators = internalNonMutators;
const mapMutators = ['set', 'delete', 'clear'];

const setNonMutators = internalNonMutators;
const setMutators = ['add', 'delete', 'clear'];

const listNonMutators = internalNonMutators.concat(['concat', 'slice', 'filter']);
const listMutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

const dateNonMutators = internalNonMutators;
const dateMutators = ['setDate', 'setFullYear', 'setHours', 'setMinutes', 'setMilliseconds', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear'];

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
  proxyMap: partial(proxyFactory, mapNonMutators, mapMutators, 'innerMap'),
  proxyList: partial(proxyFactory, listNonMutators, listMutators, 'innerList'),
  proxySet: partial(proxyFactory, setNonMutators, setMutators, 'innerSet'),
  proxyDate: partial(proxyFactory, dateNonMutators, dateMutators, 'date')
});
