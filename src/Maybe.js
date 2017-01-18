import { always, isNothing, emptyObject, haveDifferentTypes, equals } from './U'
import Base from './Base'

const reviverFactory = itemMetadata => (k, v) => {
  if (k !== '') {
    return v
  }

  const maybeValue = (v === null)
    ? null
    : itemMetadata.reviver(k, v)

  return new Maybe(maybeValue)
}

class Nothing {
  toJSON () {
    return null
  }
}

export class Just {
  constructor (v) {
    this.get = always(v)

    Object.freeze(this)
  }

  toJSON () {
    const v = this.get()

    if (isNothing(v)) {
      return null
    }

    return (v.toJSON)
      ? v.toJSON()
      : v
  }
}

export const nothing = new Nothing()

class Maybe extends Base {
  constructor (v, nothingCheck = true) {
    super(Maybe)

    const inner = (nothingCheck && isNothing(v))
      ? nothing
      : new Just(v)

    this.inner = always(inner)

    Object.freeze(this)
  }

  get (fieldOrFallbackPair) {
    const fallback = fieldOrFallbackPair[0]
    const field = fieldOrFallbackPair[1]
    const item = this.getOrElse(fallback)

    return item.get
      ? item.get(field)
      : item
  }

  set (field, v) {
    if (this.isEmpty()) {
      return this
    }

    const item = this.inner().get()

    if (isNothing(item)) {
      return this
    }

    const newItem = (item.set)
      ? item.set(field, v)
      : null

    return new Maybe(newItem)
  }

  setIn (path, v) {
    if (path.length === 0) {
      return Maybe.of(v)
    }

    const [fallbackOrFieldPair, ...restPath] = path
    const fallback = fallbackOrFieldPair[0]
    const field = fallbackOrFieldPair[1]

    const item = this.isEmpty()
      ? fallback
      : this.inner().get()

    const inner = (item.setIn)
      ? item.setIn([field, ...restPath], v)
      : null

    return Maybe.of(inner)
  }

  isEmpty () {
    return (this.inner() === nothing)
  }

  getOrElse (v) {
    return this.isEmpty()
      ? v
      : this.inner().get()
  }

  map (f) {
    return this.isEmpty()
      ? this
      : Maybe.ofAny(f(this.inner().get()))
  }

  toJSON () {
    return this.inner().toJSON()
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    const inner = this.inner()
    const otherInner = other.inner()

    if (this.isEmpty() || other.isEmpty()) {
      return inner === otherInner
    }

    return equals(inner.get(), otherInner.get())
  }

  static of (v) {
    return new Maybe(v)
  }

  static ofAny (v) {
    return new Maybe(v, false)
  }

  static metadata (itemMetadata) {
    return Object.freeze({
      type: Maybe,
      subtypes: [itemMetadata],
      reviver: reviverFactory(itemMetadata)
    })
  }

  static innerTypes () {
    return emptyObject
  }
}

Maybe.displayName = 'Maybe'
Maybe.EMPTY = Maybe.of()

export default Object.freeze(Maybe)
