import { objToArr, reviverOrAsIs, emptyObject } from './U'
import { default as AbstractMap, set, metadata } from './AbstractMap'

const parseMapper = (keyMetadata, valueMetadata) => pair => {
  const reviveKey = reviverOrAsIs(keyMetadata)
  const revivedKey = reviveKey('', pair[0])

  const reviveVal = reviverOrAsIs(valueMetadata)
  const revivedVal = reviveVal('', pair[1])

  return [revivedKey, revivedVal]
}

const reviverFactory = (keyMetadata, valueMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const innerMap = (v === null)
    ? null
    : new Map(v.map(parseMapper(keyMetadata, valueMetadata)))

  return ModelicoMap.fromMap(innerMap)
}

class ModelicoMap extends AbstractMap {
  constructor (innerMap) {
    super(ModelicoMap, innerMap)

    Object.freeze(this)
  }

  set (key, value) {
    return set(this, ModelicoMap, key, value)
  }

  toJSON () {
    return [...this.inner()]
  }

  static fromMap (map) {
    return new ModelicoMap(map)
  }

  static fromArray (pairs) {
    return ModelicoMap.fromMap(new Map(pairs))
  }

  static of (...arr) {
    const len = arr.length

    if (len % 2 === 1) {
      throw TypeError('Map.of requires an even number of arguments')
    }

    const pairs = []

    for (let i = 0; i < len; i += 2) {
      pairs.push([arr[i], arr[i + 1]])
    }

    return ModelicoMap.fromArray(pairs)
  }

  static fromObject (obj) {
    return ModelicoMap.fromArray(objToArr(obj))
  }

  static metadata (keyMetadata, valueMetadata) {
    return metadata(ModelicoMap, reviverFactory(keyMetadata, valueMetadata))
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoMap.displayName = 'ModelicoMap'
ModelicoMap.EMPTY = ModelicoMap.of()

export default Object.freeze(ModelicoMap)
