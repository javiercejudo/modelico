'use strict';

// as `let` to prevent jshint from thinking we are using it before being declared,
// which is not the case
let proxyFactory;

const proxyToSelf = (nonMutators, mutators, innerAccessor, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, innerAccessor, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  return (...args) => {
    return candidate.apply(inner, args);
  };
};

proxyFactory = (nonMutators, mutators, innerAccessor, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, innerAccessor, target, prop);
    }

    const inner = target[innerAccessor]();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, innerAccessor, target, prop);
    }

    return candidate;
  };

  // not using shortcut get due to https://github.com/nodejs/node/issues/4237
  return new Proxy(obj, {get: get});
};

export default proxyFactory;
