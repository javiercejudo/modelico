import {isNothing, unsupported, haveDifferentTypes, mem} from '../U'
import Base from './Base'

const reviver = (k, v) => {
  const date = v === null ? null : new Date(v)

  return new ModelicoDate(date)
}

const metadata = mem(() =>
  Object.freeze({
    type: ModelicoDate,
    reviver
  })
)

class ModelicoDate extends Base {
  constructor(dateOrig = new Date()) {
    super(ModelicoDate)

    if (isNothing(dateOrig)) {
      throw TypeError('missing date')
    }

    const date = new Date(dateOrig.getTime())

    this.inner = () => new Date(date.getTime())

    Object.freeze(this)
  }

  get [Symbol.toStringTag]() {
    return 'ModelicoDate'
  }

  set() {
    unsupported('Date.set is not supported')
  }

  setIn(path, date) {
    if (path.length === 0) {
      return ModelicoDate.of(date)
    }

    unsupported('Date.setIn is not supported for non-empty paths')
  }

  toJSON() {
    return this.inner().toISOString()
  }

  equals(other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return this.toJSON() === other.toJSON()
  }

  static of(date) {
    return new ModelicoDate(date)
  }

  static metadata() {
    return metadata()
  }
}

ModelicoDate.displayName = 'ModelicoDate'

export default Object.freeze(ModelicoDate)
