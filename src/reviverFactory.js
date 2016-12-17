'use strict';

import { isPlainObject, reviverOrAsIs, getInnerTypes } from './U';

const innerTypesCache = new WeakMap();

const getInnerTypesWithCache = (depth, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(depth, Type));
  }

  return innerTypesCache.get(Type);
}

const plainObjectReviverFactory = (depth, Type, k, v) =>
  Object.keys(v).reduce((acc, field) => {
    const innerTypes = getInnerTypesWithCache(depth, Type);

    const metadata = innerTypes[field];

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field]);
    } else {
      acc[field] = v[field];
    }

    return acc;
  }, {});

const reviverFactory = (depth, Type) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const fields = isPlainObject(v) ?
    plainObjectReviverFactory(depth, Type, k, v) :
    v;

  return new Type(fields);
};

export default reviverFactory;
