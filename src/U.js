'use strict';

const asIsReviver = (k, v) => v;
const bind = (fn, _1) => fn.bind(undefined, _1);

const iterableReviver = (IterableType, itemMetadata, k, v) => {
  if (k !== '') {
    return v;
  }

  const iterable = (v === null) ? null : v.map(bind(itemMetadata.reviver, k));

  return new IterableType(itemMetadata, iterable);
};

const iterableMetadata = (IterableType, itemMetadata, k, v) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviver.bind(undefined, IterableType, itemMetadata)
  });
};

export default Object.freeze({
  always: x => () => x,
  bind,
  default: (optional, fallback) => (optional === undefined) ? fallback : optional,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]]),
  reviverOrAsIs: metadata => (metadata.reviver || asIsReviver),
  asIsReviver,
  iterableReviver,
  iterableMetadata
});
