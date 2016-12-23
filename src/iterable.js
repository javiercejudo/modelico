import { partial, reviverOrAsIs, haveDifferentTypes, isSomething, haveSameValues } from './U'

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

  const items = [...thisArg]
  const otherItems = [...other]

  if (items.length !== otherItems.length) {
    return false
  }

  return items.every((item, index) => {
    const otherItem = otherItems[index]

    return (isSomething(item) && item.equals)
      ? item.equals(otherItem)
      : haveSameValues(item, otherItem)
  })
}
