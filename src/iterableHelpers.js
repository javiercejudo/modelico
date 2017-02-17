import { always, reviverOrAsIs, equals, haveDifferentTypes } from './U'

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const itemMetadataGetter = Array.isArray(itemMetadata)
    ? i => itemMetadata[i]
    : always(itemMetadata)

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

  if (haveDifferentTypes(thisArg, other) || thisArg.size !== other.size) {
    return false
  }

  const thisIter = thisArg[Symbol.iterator]()
  const otherIter = other[Symbol.iterator]()

  for (let i = 0; i < thisArg.size; i += 1) {
    const item = thisIter.next().value

    if (asUnordered) {
      if (!other.has(item)) {
        return false
      }
    } else if (!equals(item, otherIter.next().value)) {
      return false
    }
  }

  return true
}
