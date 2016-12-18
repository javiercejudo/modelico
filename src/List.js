import { isNothing, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import Base from './Base'

class List extends Base {
  constructor (innerListOrig) {
    super(List)

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list')
    }

    const innerList = [...innerListOrig]

    this.inner = () => [...innerList]
    this[Symbol.iterator] = () => innerList[Symbol.iterator]()

    Object.freeze(this)
  }

  set (index, value) {
    const newList = this.inner()
    newList[index] = value

    return List.fromArray(newList)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const item = this.inner()[path[0]]

    if (!item.setPath) {
      return this.set(path[0], value)
    }

    return this.set(path[0], item.setPath(path.slice(1), value))
  }

  toJSON () {
    return this.inner()
  }

  equals (other) {
    return iterableEquals(this, other)
  }

  static fromArray (arr) {
    return new List(arr)
  }

  static of (...arr) {
    return List.fromArray(arr)
  }

  static metadata (itemMetadata) {
    return iterableMetadata(List, itemMetadata)
  }

  static innerTypes () {
    return emptyObject
  }
}

List.displayName = 'List'
List.EMPTY = List.of()

export default Object.freeze(List)
