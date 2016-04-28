'use strict';

// as `let` to prevent jshint from thinking we are using it before being declared,
// which is not the case
let proxyFactory;

const proxyToSelf = (nonMutators, mutators, innerAccessor, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return function() {
    const newObj = target[prop].apply(target, arguments);

    return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, innerAccessor, target, prop) => {
  if (nonMutators.includes(prop)) {
    return function() {
      const newObj = target.setPath([], candidate.apply(inner, arguments));

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return function() {
      candidate.apply(inner, arguments);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, innerAccessor, newObj);
    };
  }

  return function() {
    return candidate.apply(inner, arguments);
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
