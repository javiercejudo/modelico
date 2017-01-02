import { objToArr, reviverOrAsIs, emptyObject } from './U'
import { default as AbstractMap, set, of, metadata } from './AbstractMap'

const parseMapper = (keyReviver, valueReviver) => pair => {
  const revivedKey = keyReviver('', pair[0])
  const revivedVal = valueReviver('', pair[1])

  return [revivedKey, revivedVal]
}

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(keyMetadata)
  const valueReviver = reviverOrAsIs(valueMetadata)

  const innerMap = (v === null)
    ? null
    : new Map(v.map(parseMapper(keyReviver, valueReviver)))

  return ModelicoMap.fromMap(innerMap)
}

let EMPTY_MAP

class ModelicoMap extends AbstractMap {
  constructor (innerMap) {
    super(ModelicoMap, innerMap, EMPTY_MAP)

    if (!EMPTY_MAP && this.size === 0) {
      EMPTY_MAP = this
    }

    Object.freeze(this)
  }

  set (key, value) {
    return set(this, ModelicoMap, key, value)
  }

  toJSON () {
    return [...this]
  }

  static fromMap (map) {
    return new ModelicoMap(map)
  }

  static fromArray (pairs) {
    return ModelicoMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(ModelicoMap, args)
  }

  static fromObject (obj) {
    return ModelicoMap.fromArray(objToArr(obj))
  }

  static metadata (keyMetadata, valueMetadata) {
    return metadata(ModelicoMap, reviverFactory, keyMetadata, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_MAP || ModelicoMap.of()
  }
}

ModelicoMap.displayName = 'ModelicoMap'

export default Object.freeze(ModelicoMap)
