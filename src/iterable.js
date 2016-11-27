'use strict';

import { partial } from './U';

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const revive = partial(itemMetadata.reviver, k);
  const iterable = (v === null) ? null : v.map(revive);

  return new IterableType(iterable);
};

export const iterableMetadata = (IterableType, itemMetadata) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata)
  });
};
