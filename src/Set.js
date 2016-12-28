import { isNothing, unsupported, emptyObject } from './U'
import { iterableMetadata, iterableEquals } from './iterable'
import Base from './Base'

let EMPTY_SET

class ModelicoSet extends Base {
  constructor (innerSetOrig) {
    super(ModelicoSet)

    if (isNothing(innerSetOrig)) {
      throw TypeError('missing set')
    }

    if (EMPTY_SET && innerSetOrig.size === 0) {
      return EMPTY_SET
    }

    const innerSet = new Set(innerSetOrig)

    this.inner = () => new Set(innerSet)
    this.size = innerSet.size
    this[Symbol.iterator] = () => innerSet[Symbol.iterator]()

    if (!EMPTY_SET && this.size === 0) {
      EMPTY_SET = this
    }

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

  static EMPTY () {
    return EMPTY_SET || ModelicoSet.of()
  }
}

ModelicoSet.displayName = 'ModelicoSet'

export default Object.freeze(ModelicoSet)
