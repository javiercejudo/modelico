import { isNothing, isSomething, haveDifferentTypes } from './U'
import { typeSymbol } from './symbols'
import Base from './Base'

export const set = (thisArg, Type, key, value) => {
  const newMap = thisArg.inner()
  newMap.set(key, value)

  return Type.fromMap(newMap)
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
    this[Symbol.iterator] = () => innerMap[Symbol.iterator]()
  }

  setPath (path, value) {
    if (path.length === 0) {
      return new (this[typeSymbol]())(value)
    }

    const item = this.inner().get(path[0])

    if (!item.setPath) {
      return this.set(path[0], value)
    }

    return this.set(path[0], item.setPath(path.slice(1), value))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const items = [...this]
    const otherItems = [...other]

    if (items.length !== otherItems.length) {
      return false
    }

    return items.every((item, index) => {
      const otherItem = otherItems[index]

      return item.every((itemPart, index) => {
        const otherItemPart = otherItem[index]

        return isSomething(itemPart) && itemPart.equals
          ? itemPart.equals(otherItemPart)
          : Object.is(itemPart, otherItemPart)
      })
    })
  }
}

export default Object.freeze(AbstractMap)
