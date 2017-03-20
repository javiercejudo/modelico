import Immutable from 'immutable'

import { always, reviverOrAsIs, haveDifferentTypes, identity, isFunction } from './U'

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const isTuple = Array.isArray(itemMetadata)

  if (isTuple && v.length !== itemMetadata.length) {
    throw TypeError('tuple has missing or extra items')
  }

  const itemMetadataGetter = isTuple
    ? i => isFunction(itemMetadata[i]) ? itemMetadata[i](v, path) : itemMetadata[i]
    : isFunction(itemMetadata) ? always(itemMetadata(v, path)) : always(itemMetadata)

  const revive = (x, i) => reviverOrAsIs(itemMetadataGetter(i))('', x, path.concat(i))

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

  const transform = asUnordered ? Immutable.Set : identity

  return transform(thisArg.inner()).equals(transform(other.inner()))
}
