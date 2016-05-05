'use strict';

export const asIsReviver = (k, v) => v;
export const bind = (fn, _1) => fn.bind(undefined, _1);

export const iterableReviver = (IterableType, itemMetadata, k, v) => {
  if (k !== '') {
    return v;
  }

  const iterable = (v === null) ? null : v.map(bind(itemMetadata.reviver, k));

  return new IterableType(itemMetadata, iterable);
};

export const iterableMetadata = (IterableType, itemMetadata, k, v) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviver.bind(undefined, IterableType, itemMetadata)
  });
};

export const always = x => () => x;
export const defaultTo = (fallback, optional) => (optional === undefined) ? fallback : optional;
export const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
export const reviverOrAsIs = metadata => (metadata.reviver || asIsReviver);
