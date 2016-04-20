'use strict';

const proxyToInner = (innerAccessor, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return target[prop];
    }

    const inner = target[innerAccessor]();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return candidate.bind(inner);
    }

    return candidate;
  };

  // not using shortcut get due to https://github.com/nodejs/node/issues/4237
  return new Proxy(obj, {get: get});
};

module.exports = proxyToInner;
