'use strict';

import { isPlainObject, reviverOrAsIs, getInnerTypes } from './U';

const reviverFactory = Type => {
  const innerTypes = getInnerTypes(Type);

  return (k, v) => {
    if (k !== '') {
      return v;
    }

    const fields = !isPlainObject(v) ? v : Object.keys(v).reduce((acc, field) => {
      const metadata = innerTypes[field];

      if (metadata) {
        acc[field] = reviverOrAsIs(metadata)(k, v[field]);
      } else {
        acc[field] = v[field];
      }

      return acc;
    }, {});

    return new Type(fields);
  };
};

export default reviverFactory;
