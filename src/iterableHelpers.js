// @flow

import {reviverOrAsIs, equals, haveDifferentTypes, isFunction, mem} from './U'

type Path = Array<string | number>
type BaseListMetadata = Object | Array<Object>

type ListMetadata =
  | BaseListMetadata
  | ((v: any, path: Path) => BaseListMetadata)
//

const iterableReviverFactory = (IterableType: any, itemMetadata: any) => (
  k,
  v,
  path = []
) => {
  if (k !== '') {
    return v
  }

  const isTuple = Array.isArray(itemMetadata)

  if (isTuple && v.length !== itemMetadata.length) {
    throw TypeError('tuple has missing or extra items')
  }

  const itemMetadataGetter = isTuple
    ? i =>
        isFunction(itemMetadata[i]) ? itemMetadata[i](v, path) : itemMetadata[i]
    : isFunction(itemMetadata) ? _ => itemMetadata(v, path) : _ => itemMetadata

  const revive = (x, i) =>
    reviverOrAsIs(itemMetadataGetter(i))('', x, path.concat(i))

  const iterable = v === null ? null : v.map(revive)

  return new IterableType(iterable)
}

export const iterableMetadata = mem((IterableType: any) =>
  mem((itemMetadata: ListMetadata) => {
    return Object.freeze({
      type: IterableType,
      subtypes: Object.freeze([itemMetadata]),
      reviver: iterableReviverFactory(IterableType, itemMetadata)
    })
  })
)

export const iterableEquals = (
  thisArg: any,
  other: any,
  asUnordered: boolean = false
) => {
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
