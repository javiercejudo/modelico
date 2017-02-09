import { objToArr, reviverOrAsIs, emptyObject } from './U'
import AbstractMap, { set, of, metadata } from './AbstractMap'

const stringifyReducer = (acc, pair) => {
  acc[pair[0]] = pair[1]

  return acc
}

const parseReducer = (valueReviver, obj, path) => (acc, key) =>
  [...acc, [key, valueReviver('', obj[key], path.concat(key))]]

const reviverFactory = valueMetadata => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const valueReviver = reviverOrAsIs(valueMetadata)

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).reduce(parseReducer(valueReviver, v, path), []))

  return StringMap.fromMap(innerMap)
}

let EMPTY_STRING_MAP

class StringMap extends AbstractMap {
  constructor (innerMap) {
    super(StringMap, innerMap, EMPTY_STRING_MAP)

    if (!EMPTY_STRING_MAP && this.size === 0) {
      EMPTY_STRING_MAP = this
    }

    Object.freeze(this)
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoStringMap'
  }

  set (key, value) {
    return set(this, StringMap, key, value)
  }

  toJSON () {
    return [...this].reduce(stringifyReducer, {})
  }

  static fromMap (map) {
    return new StringMap(map)
  }

  static fromArray (pairs) {
    return StringMap.fromMap(new Map(pairs))
  }

  static of (...args) {
    return of(StringMap, args)
  }

  static fromObject (obj) {
    return StringMap.fromArray(objToArr(obj))
  }

  static metadata (valueMetadata) {
    return metadata(StringMap, reviverFactory, valueMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_STRING_MAP || StringMap.of()
  }
}

StringMap.displayName = 'StringMap'

export default Object.freeze(StringMap)
