import {
  always,
  isNothing,
  metaOrTypeMapper,
  defaultTo,
  emptyArray,
  mem
} from './U'

import asIs from './asIs'
import any from './any'
import anyOf from './anyOf'
import reviverFactory from './reviverFactory'
import inferUnionClassifier from './inferUnionClassifier'

import ModelicoMap from './Map'
import StringMap from './StringMap'
import EnumMap from './EnumMap'
import ModelicoNumber from './Number'
import ModelicoDate from './Date'
import List from './List'
import ModelicoSet from './Set'
import Maybe from './Maybe'

const base = mem(Type =>
  Object.freeze({type: Type, reviver: reviverFactory(Type)})
)

const _impl = (Type, innerMetadata) =>
  Type.metadata ? Type.metadata(...innerMetadata) : base(Type)

const _implMem = mem(Type => mem(innerMetadata => _impl(Type, innerMetadata)))
const _ = (Type, innerMetadata = emptyArray) => _implMem(Type)(innerMetadata)

const withDefaultImpl = (metadata, def) => {
  const reviver = (k, v, path = []) => {
    if (k !== '') {
      return v
    }

    if (isNothing(v)) {
      const defMetadata = defaultTo(metadata)(metadata.baseMetadata)

      return defMetadata.reviver(k, def, path)
    }

    return metadata.reviver(k, v, path)
  }

  return Object.freeze(
    Object.assign({}, metadata, {
      default: JSON.parse(JSON.stringify(def)),
      reviver
    })
  )
}

const withDefaultMem = mem(metadata =>
  mem(def => withDefaultImpl(metadata, def), () => new Map())
)

const withDefault = (metadata, def) => withDefaultMem(metadata)(def)

const union = (Type, metasOrTypes, classifier) => {
  const metas = metasOrTypes.map(metaOrTypeMapper(_))

  classifier = classifier === undefined
    ? inferUnionClassifier(metas)
    : classifier

  const reviver = (k, obj, path = []) => {
    if (k !== '') {
      return obj
    }

    return classifier(obj, metas).reviver(k, obj, path)
  }

  return Object.assign({}, base(Type), {reviver, subtypes: metas})
}

const metadata = always(
  Object.freeze({
    _,
    base,
    asIs,
    any,
    anyOf,
    union,

    number: always(asIs(Number)),
    string: always(asIs(String)),
    boolean: always(asIs(Boolean)),

    wrappedNumber: ModelicoNumber.metadata,
    date: ModelicoDate.metadata,
    enumMap: EnumMap.metadata,
    list: List.metadata,
    map: ModelicoMap.metadata,
    stringMap: StringMap.metadata,
    maybe: Maybe.metadata,
    set: ModelicoSet.metadata,

    withDefault
  })
)

export default metadata
