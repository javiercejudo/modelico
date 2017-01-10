import { always, isNothing, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import Base from './Base'

let EMPTY_LIST

class List extends Base {
  constructor (innerList) {
    super(List)

    if (isNothing(innerList)) {
      throw TypeError('missing list')
    }

    if (EMPTY_LIST && innerList.length === 0) {
      return EMPTY_LIST
    }

    Object.freeze(innerList)

    this.inner = always(innerList)
    this.size = innerList.length
    this[Symbol.iterator] = () => innerList[Symbol.iterator]()

    if (!EMPTY_LIST && this.size === 0) {
      EMPTY_LIST = this
    }

    Object.freeze(this)
  }

  includes (...args) {
    return this.inner().includes(...args)
  }

  get (index) {
    return this.inner()[index]
  }

  set (index, value) {
    const newList = [...this]
    newList[index] = value

    return List.fromArray(newList)
  }

  setPath (path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path
    const item = this.inner()[key]

    if (!item.setPath) {
      return this.set(key, value)
    }

    return this.set(key, item.setPath(restPath, value))
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

  static EMPTY () {
    return EMPTY_LIST || List.of()
  }
}

List.displayName = 'List'

export default Object.freeze(List)
