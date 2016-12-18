import { partial, reviverOrAsIs } from './U'

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

  const otherItems = [...other]

  return [...thisArg].every((item, index) => {
    const otherItem = otherItems[index]

    return item.equals
      ? item.equals(otherItem)
      : item === otherItem
  })
}
