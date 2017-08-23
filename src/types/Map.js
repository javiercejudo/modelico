import {always, objToArr, reviverOrAsIs, isFunction} from '../U'
import AbstractMap, {of, metadata} from './AbstractMap'

const asArraySymbol = Symbol('asArray')

const parseMapperFactory = (keyReviver, valueReviver, path) => (pair, i) => [
  keyReviver('', pair[0], path.concat(i, 0)),
  valueReviver('', pair[1], path.concat(i, 1))
]

const arrToObjReducer = (acc, pair) => {
  acc[JSON.stringify(pair[0])] = pair[1]

  return acc
}

const reviverFactory = (kMetadata, vMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const kIsFun = isFunction(kMetadata)
  const vIsFun = isFunction(vMetadata)
  const kReviver = reviverOrAsIs(kIsFun ? kMetadata(v, path) : kMetadata)
  const vReviver = reviverOrAsIs(vIsFun ? vMetadata(v, path) : vMetadata)

  if (v === null) {
    return new ModelicoMap(null)
  }

  const asArray = Array.isArray(v)
  const parseMapper = parseMapperFactory(kReviver, vReviver, path)
  const reviveFromArray = () => v.map(parseMapper)

  const reviveFromObject = () =>
    objToArr(v)
      .map((pair, i) => [JSON.parse(pair[0]), pair[1]])
      .map(parseMapper)

  return ModelicoMap.fromMapWithOptions(
    {asArray},
    new Map(asArray ? reviveFromArray() : reviveFromObject())
  )
}

let EMPTY_MAP
let EMPTY_MAP_AS_OBJECT

/**
 * myMap[Object.getOwnPropertySymbols(myMap)
 *   .filter(x => x.toString() === 'Symbol(asArray)')[0]]()
 */
class ModelicoMap extends AbstractMap {
  constructor(innerMap, {asArray = true} = {}) {
    const EMPTY = asArray ? EMPTY_MAP : EMPTY_MAP_AS_OBJECT
    super(ModelicoMap, innerMap, EMPTY)

    if (this.size === 0) {
      if (!EMPTY) {
        this[asArraySymbol] = always(asArray)

        if (asArray) {
          EMPTY_MAP = this
        } else {
          EMPTY_MAP_AS_OBJECT = this
        }
      }
    } else {
      this[asArraySymbol] = always(asArray)
    }

    Object.freeze(this)
  }

  get [Symbol.toStringTag]() {
    return 'ModelicoMap'
  }

  set(key, value) {
    const asArray = this[asArraySymbol]()
    const newMap = this.inner()
    newMap.set(key, value)

    return ModelicoMap.fromMapWithOptions({asArray}, newMap)
  }

  toJSON() {
    const asArray = [...this]

    return this[asArraySymbol]() ? asArray : asArray.reduce(arrToObjReducer, {})
  }

  static fromMap(map) {
    return new ModelicoMap(map)
  }

  static fromMapWithOptions(options, map) {
    return new ModelicoMap(map, options)
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
