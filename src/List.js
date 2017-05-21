import {always, isNothing} from './U'
import {iterableMetadata, iterableEquals} from './iterableHelpers'
import {innerOrigSymbol} from './symbols'
import Base from './Base'

let EMPTY_LIST

class List extends Base {
  constructor(innerList = []) {
    super(List)

    if (isNothing(innerList)) {
      throw TypeError('missing list')
    }

    if (EMPTY_LIST && innerList.length === 0) {
      return EMPTY_LIST
    }

    Object.freeze(innerList)

    this.inner = always(innerList)
    this[innerOrigSymbol] = this.inner
    this.size = innerList.length

    if (!EMPTY_LIST && this.size === 0) {
      EMPTY_LIST = this
    }

    Object.freeze(this)
  }

  get [Symbol.toStringTag]() {
    return 'ModelicoList'
  }

  [Symbol.iterator]() {
    return this.inner()[Symbol.iterator]()
  }

  includes(...args) {
    return this.inner().includes(...args)
  }

  get(index) {
    return this.inner()[index]
  }

  set(index, value) {
    const newList = [...this]
    newList[index] = value

    return List.fromArray(newList)
  }

  setIn(path, value) {
    if (path.length === 0) {
      return List.fromArray(value)
    }

    const [key, ...restPath] = path
    const item = this.inner()[key]

    if (!item.setIn) {
      return this.set(key, value)
    }

    return this.set(key, item.setIn(restPath, value))
  }

  toJSON() {
    return this.inner()
  }

  toArray() {
    return this.toJSON()
  }

  equals(other) {
    return iterableEquals(this, other)
  }

  static fromArray(arr) {
    return new List(arr)
  }

  static of(...arr) {
    return List.fromArray(arr)
  }

  static metadata(itemMetadata) {
    return iterableMetadata(List)(itemMetadata)
  }

  static EMPTY() {
    return EMPTY_LIST || List.of()
  }
}

List.displayName = 'List'

export default Object.freeze(List)
