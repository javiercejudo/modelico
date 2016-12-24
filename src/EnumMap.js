import { reviverOrAsIs, emptyObject } from './U'
import { default as AbstractMap, set, of, metadata } from './AbstractMap'

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1]

  return acc
}

const parseMapper = (keyMetadata, valueMetadata, object) => enumerator => {
  const reviveKey = reviverOrAsIs(keyMetadata)
  const key = reviveKey('', enumerator)

  const reviveVal = reviverOrAsIs(valueMetadata)
  const val = reviveVal('', object[enumerator])

  return [key, val]
}

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).map(parseMapper(keyMetadata, valueMetadata, v)))

  return new EnumMap(innerMap)
}

class EnumMap extends AbstractMap {
  constructor (innerMap) {
    super(EnumMap, innerMap)

    Object.freeze(this)
  }

  set (enumerator, value) {
    return set(this, EnumMap, enumerator, value)
  }

  toJSON () {
    return [...this.inner()].reduce(stringifyReducer, {})
  }

  static fromMap (map) {
    return new EnumMap(map)
  }

  static fromArray (pairs) {
    return EnumMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(EnumMap, args)
  }

  static metadata (keyMetadata, valueMetadata) {
    return metadata(EnumMap, reviverFactory(keyMetadata, valueMetadata))
  }

  static innerTypes () {
    return emptyObject
  }
}

EnumMap.displayName = 'EnumMap'
EnumMap.EMPTY = EnumMap.of()

export default Object.freeze(EnumMap)
