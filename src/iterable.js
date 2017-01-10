import Immutable from 'immutable'

import { partial, reviverOrAsIs, haveDifferentTypes, identity } from './U'

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

export const iterableEquals = (thisArg, other, asUnordered = false) => {
  if (thisArg === other) {
    return true
  }

  if (haveDifferentTypes(thisArg, other)) {
    return false
  }

  const thisInner = thisArg.inner()
  const transform = (asUnordered && Immutable.OrderedSet.isOrderedSet(thisInner))
    ? Immutable.Set
    : identity

  return transform(thisInner).equals(transform(other.inner()))
}
