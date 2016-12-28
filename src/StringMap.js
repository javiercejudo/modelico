import { objToArr, reviverOrAsIs, emptyObject } from './U'
import { default as AbstractMap, set, of, metadata } from './AbstractMap'

const stringifyReducer = (acc, pair) => {
  acc[pair[0]] = pair[1]

  return acc
}

const parseReducer = (valueReviver, obj) => (acc, key) =>
  [...acc, [key, valueReviver('', obj[key])]]

const reviverFactory = valueMetadata => (k, v) => {
  if (k !== '') {
    return v
  }

  const valueReviver = reviverOrAsIs(valueMetadata)

  const innerMap = (v === null)
    ? null
    : new Map(Object.keys(v).reduce(parseReducer(valueReviver, v), []))

  return StringMap.fromMap(innerMap)
}

class StringMap extends AbstractMap {
  constructor (innerMap) {
    super(StringMap, innerMap)

    Object.freeze(this)
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
    return metadata(StringMap, reviverFactory(valueMetadata))
  }

  static innerTypes () {
    return emptyObject
  }
}

StringMap.displayName = 'StringMap'
StringMap.EMPTY = StringMap.of()

export default Object.freeze(StringMap)