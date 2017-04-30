import {always, isNothing, isPlainObject, defaultTo} from './U'

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
      default: reviver('', undefined),
      reviver
    })
  )
}

const union = (Type, metasOrTypes, classifier) => {
  const metas = metasOrTypes.map(x => (isPlainObject(x) ? x : _(x)))

  classifier = classifier === undefined
    ? inferUnionClassifier(metas)
    : classifier

  const reviver = (k, obj, path = []) => {
    if (k !== '') {
      return obj
    }

    return classifier(obj).reviver(k, obj, path)
  }

  return Object.assign({}, base(Type), {reviver, subtypes: metas})
}

const metadata = () =>
  Object.freeze({
    _,
    base,
    asIs,
    any,
    anyOf,
    union,
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
