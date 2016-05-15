'use strict';

const is = (Ctor, val) => val !== null && val !== undefined && val.constructor === Ctor || val instanceof Ctor;

export const checkRequired = (typeName, metadata, field) => value => {
  if (metadata.options && metadata.options.required === true && value === undefined) {
    throw new TypeError(`"${field}" in ${typeName} is required`);
  }

  return value;
};

export const checkStrict = (typeName, metadata, field) => value => {
  if (metadata.options && metadata.options.strict === true && !is(metadata.type, value)) {
    throw new TypeError(`"${field}" in ${typeName} must be of type ${metadata.type.name}`);
  }

  return value;
};

export const checkNull = (typeName, metadata, field) => value => {
  if (metadata.options && metadata.options.nullable === false && value === null) {
    throw new TypeError(`"${field}" in ${typeName} cannot be null`);
  }

  return value;
};
