const cacheRegistry = new WeakMap()

const withCache = (obj, fn, args = [], key = fn) => {
  if (!cacheRegistry.has(obj)) {
    cacheRegistry.set(obj, new Map())
  }

  const cache = cacheRegistry.get(obj)

  if (!cache.has(key)) {
    cache.set(key, fn.apply(obj, args))
  }

  return cache.get(key)
}

export default withCache
