import Immutable from 'immutable'

import { always, isNothing, haveDifferentTypes } from './U'
import { typeSymbol } from './symbols'
import Base from './Base'

export const set = (thisArg, Type, key, value) => {
  const immutableMap = thisArg.inner()
  const newImmutableMap = immutableMap.set(key, value)

  if (immutableMap === newImmutableMap) {
    return thisArg
  }

  return Type.fromArray([...newImmutableMap])
}

export const of = (Type, args) => {
  const len = args.length

  if (len % 2 === 1) {
    throw TypeError(`${Type.displayName || Type.name}.of requires an even number of arguments`)
  }

  const map = new Map()

  for (let i = 0; i < len; i += 2) {
    map.set(args[i], args[i + 1])
  }

  return Type.fromMap(map)
}

export const metadata = (Type, reviverFactory, keyMetadata, valueMetadata) => {
  return Object.freeze({
    type: Type,
    subtypes: Object.freeze([keyMetadata, valueMetadata]),
    reviver: reviverFactory(keyMetadata, valueMetadata)
  })
}

class AbstractMap extends Base {
  constructor (Type, innerMapOrig, EMPTY) {
    super(Type)

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map')
    }

    if (EMPTY && innerMapOrig.size === 0) {
      return EMPTY
    }

    const innerMap = Immutable.OrderedMap(innerMapOrig)

    this.inner = always(innerMap)
    this.size = innerMap.size
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]()
  }

  setPath (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const [key, ...restPath] = path
    const item = this.inner().get(key)

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return this.inner().equals(other.inner())
  }
}

export default Object.freeze(AbstractMap)
