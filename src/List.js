import Immutable from 'immutable'

import { always, isNothing, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import Base from './Base'

class List extends Base {
  constructor (innerListOrig) {
    super(List)

    if (isNothing(innerListOrig)) {
      throw TypeError('missing list')
    }

    const innerList = Immutable.List(innerListOrig)

    this.inner = always(innerList)
    this[Symbol.iterator] = () => innerList[Symbol.iterator]()

    Object.freeze(this)
  }

  set (index, value) {
    const newList = [...this.inner().set(index, value)]

    return List.fromArray(newList)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path
    const item = this.inner().get(key)

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
  }

  toJSON () {
    return [...this.inner()]
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
