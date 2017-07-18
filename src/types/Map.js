import {objToArr, reviverOrAsIs, isFunction} from '../U'
import AbstractMap, {set, of, metadata} from './AbstractMap'

const parseMapper = (keyReviver, valueReviver, path) => (pair, i) => [
  keyReviver('', pair[0], path.concat(i, 0)),
  valueReviver('', pair[1], path.concat(i, 1))
]

const reviverFactory = (keyMetadata, valueMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const keyReviver = reviverOrAsIs(
    isFunction(keyMetadata) ? keyMetadata(v, path) : keyMetadata
  )
  const valueReviver = reviverOrAsIs(
    isFunction(valueMetadata) ? valueMetadata(v, path) : valueMetadata
  )

  const innerMap =
    v === null
      ? null
      : new Map(v.map(parseMapper(keyReviver, valueReviver, path)))

  return ModelicoMap.fromMap(innerMap)
}

let EMPTY_MAP

class ModelicoMap extends AbstractMap {
  constructor(innerMap) {
    super(ModelicoMap, innerMap, EMPTY_MAP)

    if (!EMPTY_MAP && this.size === 0) {
      EMPTY_MAP = this
    }

    Object.freeze(this)
  }

  get [Symbol.toStringTag]() {
    return 'ModelicoMap'
  }

  set(key, value) {
    return set(this, ModelicoMap, key, value)
  }

  toJSON() {
    return [...this]
  }

  static fromMap(map) {
    return new ModelicoMap(map)
  }

  static fromArray(pairs) {
    return ModelicoMap.fromMap(new Map(pairs))
  }

  static of(...args) {
    return of(ModelicoMap, args)
  }

  static fromObject(obj) {
    return ModelicoMap.fromArray(objToArr(obj))
  }

  static metadata(keyMetadata, valueMetadata) {
    return metadata(ModelicoMap)(reviverFactory)(keyMetadata)(valueMetadata)
  }

  static EMPTY() {
    return EMPTY_MAP || ModelicoMap.of()
  }
}

ModelicoMap.displayName = 'ModelicoMap'

export default Object.freeze(ModelicoMap)
