'use strict';

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const iterable = (v === null) ? null : v.map(itemMetadata.reviver.bind(undefined, k));

  return new IterableType(itemMetadata, iterable);
};

export const asIsReviver = (k, v) => v;
export const always = x => () => x;
export const defaultTo = (fallback, optional) => (optional === undefined) ? fallback : optional;
export const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
export const reviverOrAsIs = metadata => (metadata.reviver || asIsReviver);

export const iterableMetadata = (IterableType, itemMetadata, k, v) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};
