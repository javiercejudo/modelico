const proxyToSelf = (nonMutators, mutators, innerCloner, target, prop) => {
  if (!nonMutators.includes(prop)) {
    return target[prop]
  }

  return (...args) => {
    const newObj = target[prop](...args)

    return proxyFactory(nonMutators, mutators, innerCloner, newObj)
  }
}

const proxyToInner = (inner, candidate, nonMutators, mutators, innerCloner, target, prop) => {
  if (nonMutators.includes(prop)) {
    return (...args) => {
      const newObj = target.setIn([], candidate.apply(inner, args))

      return proxyFactory(nonMutators, mutators, innerCloner, newObj)
    }
  }

  if (mutators.includes(prop)) {
    return (...args) => {
      candidate.apply(inner, args)
      const newObj = target.setIn([], inner)

      return proxyFactory(nonMutators, mutators, innerCloner, newObj)
    }
  }

  return (...args) => {
    return candidate.apply(inner, args)
  }
}

const proxyFactory = (nonMutators, mutators, innerCloner, obj) => {
  const get = (target, prop) => {
    if (prop in target) {
      return proxyToSelf(nonMutators, mutators, innerCloner, target, prop)
    }

    const inner = innerCloner(target.inner())
    const candidate = inner[prop]

    if (typeof candidate === 'function') {
      return proxyToInner(inner, candidate, nonMutators, mutators, innerCloner, target, prop)
    }

    return candidate
  }

  return new Proxy(obj, {get})
}

export default proxyFactory
