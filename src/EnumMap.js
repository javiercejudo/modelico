import { reviverOrAsIs, emptyObject } from './U'
import { default as AbstractMap, set, of, metadata } from './AbstractMap'

const stringifyReducer = (acc, pair) => {
  acc[pair[0].toJSON()] = pair[1]

  return acc
}

const parseMapper = (keyReviver, valueReviver, obj) => enumerator => {
  const key = keyReviver('', enumerator)
  const val = valueReviver('', obj[enumerator])

  return [key, val]
}

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(keyMetadata)
  const valueReviver = reviverOrAsIs(valueMetadata)

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).map(parseMapper(keyReviver, valueReviver, v)))

  return new EnumMap(innerMap)
}

let EMPTY_ENUM_MAP

class EnumMap extends AbstractMap {
  constructor (innerMap) {
    super(EnumMap, innerMap, EMPTY_ENUM_MAP)

    if (!EMPTY_ENUM_MAP && this.size === 0) {
      EMPTY_ENUM_MAP = this
    }

    Object.freeze(this)
  }

  set (enumerator, value) {
    return set(this, EnumMap, enumerator, value)
  }

  toJSON () {
    return [...this].reduce(stringifyReducer, {})
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
    return metadata(EnumMap, reviverFactory, keyMetadata, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_ENUM_MAP || EnumMap.of()
  }
}

EnumMap.displayName = 'EnumMap'

export default Object.freeze(EnumMap)
