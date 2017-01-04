import { partial, reviverOrAsIs, haveDifferentTypes } from './U'

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
    subtypes: Object.freeze([itemMetadata]),
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

  return thisArg.inner().equals(other.inner())
}
