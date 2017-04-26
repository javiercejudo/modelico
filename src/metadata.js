import {always, isNothing} from './U'

import asIs from './asIs'
import any from './any'
import anyOf from './anyOf'
import reviverFactory from './reviverFactory'

import ModelicoMap from './Map'
import StringMap from './StringMap'
import EnumMap from './EnumMap'
import ModelicoNumber from './Number'
import ModelicoDate from './Date'
import List from './List'
import ModelicoSet from './Set'
import Maybe from './Maybe'

const metadataCache = new WeakMap()

const base = Type => Object.freeze({type: Type, reviver: reviverFactory(Type)})

const raw_ = (Type, innerMetadata) =>
  (Type.metadata ? Type.metadata(...innerMetadata) : base(Type))

const _ = (Type, metadata = []) => {
  if (metadata.length > 0) {
    return raw_(Type, metadata)
  }

  if (!metadataCache.has(Type)) {
    metadataCache.set(Type, raw_(Type, metadata))
  }

  return metadataCache.get(Type)
}

const withDefault = (metadata, def) => {
  const reviver = (k, v) => {
    if (k !== '') {
      return v
    }

    return metadata.reviver(k, isNothing(v) ? def : v)
  }

  return Object.freeze(
    Object.assign({}, metadata, {
      default: reviver('', def),
      reviver
    })
  )
}

const metadata = () =>
  Object.freeze({
    _,
    base,
    asIs,
    any,
    anyOf,
    number: ({wrap = false} = {}) =>
      (wrap ? ModelicoNumber.metadata() : asIs(Number)),

    string: always(asIs(String)),
    boolean: always(asIs(Boolean)),

    date: ModelicoDate.metadata,
    enumMap: EnumMap.metadata,
    list: List.metadata,
    map: ModelicoMap.metadata,
    stringMap: StringMap.metadata,
    maybe: Maybe.metadata,
    set: ModelicoSet.metadata,

    withDefault
  })

export default metadata
