import Immutable from 'immutable'

import { always, isNothing, unsupported, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import { innerOrigSymbol } from './symbols'
import Base from './Base'

let EMPTY_SET

class ModelicoSet extends Base {
  constructor (innerSetOrig, asUnordered = false) {
    super(ModelicoSet)

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    if (EMPTY_SET && innerSetOrig.size === 0) {
      return EMPTY_SET
    }

    const SetImpl = asUnordered ? Immutable.Set : Immutable.OrderedSet
    const innerSet = SetImpl(innerSetOrig)

    this[innerOrigSymbol] = always(innerSet)
    this.inner = always(innerSet)
    this.size = innerSet.size
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]()

    if (!EMPTY_SET && this.size === 0) {
      EMPTY_SET = this
    }

    Object.freeze(this)
  }

  has (key) {
    return this[innerOrigSymbol]().has(key)
  }

  set () {
    unsupported('Set.set is not supported')
  }

  setPath (path, set) {
    if (path.length === 0) {
      return new ModelicoSet(set)
    }

    unsupported('Set.setPath is not supported for non-empty paths')
  }

  toJSON () {
    return [...this]
  }

  equals (...args) {
    return iterableEquals(this, ...args)
  }

  static fromSet (set) {
    return new ModelicoSet(set)
  }

  static fromArray (arr) {
    return ModelicoSet.fromSet(new Set(arr))
  }

  static of (...arr) {
    return ModelicoSet.fromArray(arr)
  }

  static metadata (itemMetadata) {
    return iterableMetadata(ModelicoSet, itemMetadata)
  }

  static innerTypes () {
    return emptyObject
  }

  static EMPTY () {
    return EMPTY_SET || ModelicoSet.of()
  }
}

ModelicoSet.displayName = 'ModelicoSet'

export default Object.freeze(ModelicoSet)
