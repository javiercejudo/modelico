import { always, isNothing, haveDifferentTypes, equals, defaultTo, isFunction } from './U'
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

  const revivedValue = revive(k, v, path)

  return Maybe.of(revivedValue)
}

class Maybe extends Base {
  constructor () {
    super(undefined, Maybe)
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

    const item = this.inner()

    if (isNothing(item)) {
      return this
    }

    const newItem = (item.set)
      ? item.set(field, v)
      : null

    return Maybe.of(newItem)
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
      : this.inner()

    const inner = (item.setIn)
      ? item.setIn([field, ...restPath], v)
      : null

    return Maybe.of(inner)
  }

  static of (v) {
    return isNothing(v)
      ? new Nothing()
      : new Just(v)
  }

  static metadata (itemMetadata) {
    return Object.freeze({
      type: Maybe,
      subtypes: [itemMetadata],
      reviver: reviverFactory(itemMetadata),
      default: new Nothing()
    })
  }
}

Maybe.displayName = 'Maybe'

let nothing

class Nothing extends Maybe {
  constructor () {
    super()

    if (!nothing) {
      this.inner = always(TypeError('nothing holds no value'))
      nothing = this
    }

    return nothing
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoNothing'
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

  equals (other) {
    return (this === other)
  }
}

class Just extends Maybe {
  constructor (v) {
    super()

    this.inner = always(v)

    Object.freeze(this)
  }

  get [Symbol.toStringTag] () {
    return 'ModelicoJust'
  }

  toJSON () {
    const v = this.inner()

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
    return this.inner()
  }

  map (f) {
    return Just.of(f(this.inner()))
  }

  equals (other) {
    if (this === other) {
      return true
    }

    if (haveDifferentTypes(this, other)) {
      return false
    }

    return equals(this.inner(), other.inner())
  }

  static of (v) {
    return new Just(v)
  }
}

Just.displayName = 'Just'

Maybe.Nothing = new Nothing()
Maybe.Just = Just

export default Object.freeze(Maybe)
