import { always, isNothing, emptyObject, haveDifferentTypes, equals, defaultTo, isFunction } from './U'
import Base from './Base'

const reviverFactory = itemMetadata => (k, v, path) => {
  if (k !== '') {
    return v
  }

  const metadata = isFunction(itemMetadata)
    ? itemMetadata(v, path)
    : itemMetadata

  const revive = (v === null)
    ? always(null)
    : defaultTo(metadata.reviver)(metadata.maybeReviver)

  return new Maybe(revive(k, v, path))
}

let nothing

export class Nothing {
  constructor () {
    if (!nothing) {
      this.get = always(null)
      nothing = this
    }

    return nothing
  }

  toJSON () {
    return null
  }

  isEmpty () {
    return true
  }

  getOrElse (v) {
    return v
  }

  map () {
    return this
  }

  static of () {
    return new Nothing()
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

  isEmpty () {
    return false
  }

  getOrElse (v) {
    return this.get()
  }

  map (f) {
    return Just.of(f(this.get()))
  }

  static of (v) {
    return new Just(v)
  }
}

class Maybe extends Base {
  constructor (v, nothingCheck = true) {
    super(Maybe)

    const inner = (nothingCheck && isNothing(v))
      ? Nothing.of()
      : Just.of(v)

    this.inner = always(inner)

    Object.freeze(this)
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoMaybe'
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
    return this.inner().isEmpty()
  }

  getOrElse (v) {
    return this.inner().getOrElse(v)
  }

  map (f) {
    return Maybe.ofAny(this.inner().map(f).get())
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
      reviver: reviverFactory(itemMetadata),
      default: Maybe.of()
    })
  }

  static innerTypes () {
    return emptyObject
  }
}

Maybe.displayName = 'Maybe'
Maybe.EMPTY = Maybe.of()

export default Object.freeze(Maybe)
