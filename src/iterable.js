'use strict';

import { pipe, partial } from './U';
import { checkStrict, checkNull } from './checks';

const iterableReviverFactory = (IterableType, itemMetadata) => (k, v) => {
  if (k !== '') {
    return v;
  }

  const itemCheckStrict = (item, index) => checkStrict('Iterable', itemMetadata, `items[${index}]`)(item);
  const itemCheckNull = (item, index) => checkNull('Iterable', itemMetadata, `items[${index}]`)(item);
  const revive = partial(itemMetadata.reviver, k);

  const iterable = (v === null) ? null : v.map((item, index) => {
    itemCheckStrict(item, index);
    itemCheckNull(item, index);

    return revive(item);
  });

  return new IterableType(itemMetadata, iterable);
};

export const iterableMetadata = (options, IterableType, itemMetadata, k, v) => {
  return Object.freeze({
    type: IterableType,
    reviver: iterableReviverFactory(IterableType, itemMetadata),
    options
  });
};
