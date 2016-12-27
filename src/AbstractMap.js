import { isNothing, equals, haveDifferentTypes } from './U'
import { typeSymbol } from './symbols'
import Base from './Base'

export const set = (thisArg, Type, key, value) => {
  const newMap = thisArg.inner()
  newMap.set(key, value)

  return Type.fromMap(newMap)
}

export const of = (Type, args) => {
  const len = args.length

  if (len % 2 === 1) {
    throw TypeError(`${Type.displayName || Type.name}.of requires an even number of arguments`)
  }

  const pairs = []

  for (let i = 0; i < len; i += 2) {
    pairs.push([args[i], args[i + 1]])
  }

  return Type.fromArray(pairs)
}

export const metadata = (Type, reviver) => {
  return Object.freeze({type: Type, reviver})
}

class AbstractMap extends Base {
  constructor (Type, innerMapOrig) {
    super(Type)

    if (isNothing(innerMapOrig)) {
      throw TypeError('missing map')
    }

    const innerMap = new Map(innerMapOrig)

    this.inner = () => new Map(innerMap)
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

    if (this.size !== other.size) {
      return false
    }

    const thisIter = this[Symbol.iterator]()
    const otherIter = other[Symbol.iterator]()

    for (let i = 0; i < this.size; i += 1) {
      const item = thisIter.next().value
      const otherItem = otherIter.next().value

      const areEqual = item.every((itemPart, index) => equals(itemPart, otherItem[index]))

      if (!areEqual) {
        return false
      }
    }

    return true
  }
}

export default Object.freeze(AbstractMap)
