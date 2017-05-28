// @flow

import {Set as ImmutableSet} from 'immutable'

import {
  always,
  reviverOrAsIs,
  haveDifferentTypes,
  identity,
  isFunction,
  mem
} from './U'

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
    : isFunction(itemMetadata)
        ? always(itemMetadata(v, path))
        : always(itemMetadata)

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

  if (haveDifferentTypes(thisArg, other)) {
    return false
  }

  const transform: any = asUnordered ? ImmutableSet : identity

  return transform(thisArg.inner()).equals(transform(other.inner()))
}
