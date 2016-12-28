import Immutable from 'immutable'

import { always, isNothing, unsupported, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import Base from './Base'

class ModelicoSet extends Base {
  constructor (innerSetOrig) {
    super(ModelicoSet)

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    const innerSet = Immutable.OrderedSet(innerSetOrig)

    this.inner = always(innerSet)
    this.size = innerSet.size
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]()

    Object.freeze(this)
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

  equals (other) {
    return iterableEquals(this, other)
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
}

ModelicoSet.displayName = 'ModelicoSet'
ModelicoSet.EMPTY = ModelicoSet.of()

export default Object.freeze(ModelicoSet)
