import { partial, reviverOrAsIs, equals, haveDifferentTypes } from './U'

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v
  }

  const revive = partial(reviverOrAsIs(itemMetadata), k)
  const iterable = (v === null)
    ? null
    : v.map(revive)

  return new IterableType(iterable)
}

export const iterableMetadata = (IterableType, itemMetadata) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  })
}

export const iterableEquals = (thisArg, other) => {
  if (thisArg === other) {
    return true
  }

  if (haveDifferentTypes(thisArg, other)) {
    return false
  }

  if (thisArg.size !== other.size) {
    return false
  }

  const thisIter = thisArg[Symbol.iterator]()
  const otherIter = other[Symbol.iterator]()

  for (let i = 0; i < thisArg.size; i += 1) {
    if (!equals(thisIter.next().value, otherIter.next().value)) {
      return false
    }
  }

  return true
}
