import { isNothing, unsupported, emptyObject, always, haveDifferentTypes, haveSameValues } from './U'
import { innerOrigSymbol } from './symbols'
import Base from './Base'

const reviver = (k, v) => {
  return ModelicoNumber.of(v)
}

class ModelicoNumber extends Base {
  constructor (numberOrig = 0) {
    super(ModelicoNumber)

    if (!Number.isNaN(numberOrig) && isNothing(numberOrig)) {
      throw TypeError('missing number')
    }

    const number = Number(numberOrig)

    this[innerOrigSymbol] = always(number)
    this.inner = this[innerOrigSymbol]

    Object.freeze(this)
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoNumber'
  }

  set () {
    unsupported('Number.set is not supported')
  }

  setIn (path, number) {
    if (path.length === 0) {
      return ModelicoNumber.of(number)
    }

    unsupported('ModelicoNumber.setIn is not supported for non-empty paths')
  }

  toJSON () {
    const v = this.inner()

    return Object.is(v, -0) ? '-0'
      : (v === Infinity) ? 'Infinity'
      : (v === -Infinity) ? '-Infinity'
      : Number.isNaN(v) ? 'NaN'
      : v
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return haveSameValues(this.inner(), other.inner())
  }

  [Symbol.toPrimitive] (hint) {
    const innerNumber = this.inner()

    return (hint === 'string')
      ? String(innerNumber)
      : innerNumber
  }

  valueOf () {
    return this.inner()
  }

  toString () {
    return String(this.inner())
  }

  static of (number) {
    return new ModelicoNumber(number)
  }

  static metadata () {
    return Object.freeze({
      type: ModelicoNumber,
      reviver
    })
  }

  static innerTypes () {
    return emptyObject
  }
}

ModelicoNumber.displayName = 'ModelicoNumber'

export default Object.freeze(ModelicoNumber)
