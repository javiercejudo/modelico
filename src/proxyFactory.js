'use strict';

// as `let` to prevent jshint from thinking we are using it before being declared,
// which is not the case
let proxyFactory;

const proxyToSelf = (nonMutators, mutators, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop];
  }

  return (...args) => {
    const newObj = target[prop](...args);

    return proxyFactory(nonMutators, mutators, newObj);
  };
};

const proxyToInner = (inner, candidate, nonMutators, mutators, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setPath([], candidate.apply(inner, args));

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args);
      const newObj = target.setPath([], inner);

      return proxyFactory(nonMutators, mutators, newObj);
    };
  }

  return (...args) => {
    return candidate.apply(inner, args);
  };
};

proxyFactory = (nonMutators, mutators, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, target, prop);
    }

    const inner = target.inner();
    const candidate = inner[prop];

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, target, prop);
    }

    return candidate;
  };

  return new Proxy(obj, {get});
};

export default proxyFactory;
