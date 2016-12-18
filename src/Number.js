import { isNothing, unsupported, emptyObject, always } from './U'
import Base from './Base'

const reviver = (k, v) => {
  return ModelicoNumber.of(v)
}

class ModelicoNumber extends Base {
  constructor (number) {
    super(ModelicoNumber)

    if (!Number.isNaN(number) && isNothing(number)) {
      throw TypeError('missing number')
    }

    this.inner = always(Number(number))

    Object.freeze(this)
  }

  set () {
    unsupported('Number.set is not supported')
  }

  setPath (path, number) {
    if (path.length === 0) {
      return ModelicoNumber.of(number)
    }

    unsupported('ModelicoNumber.setPath is not supported for non-empty paths')
  }

  toJSON () {
    const v = this.inner()

    return Object.is(v, -0) ? '-0'
      : Object.is(v, Infinity) ? 'Infinity'
      : Object.is(v, -Infinity) ? '-Infinity'
      : Object.is(v, NaN) ? 'NaN'
      : v
  }

  static of (number) {
    return new ModelicoNumber(number)
  }

  static metadata () {
    return Object.freeze({type: ModelicoNumber, reviver})
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoNumber.displayName = 'ModelicoNumber'

export default Object.freeze(ModelicoNumber)
