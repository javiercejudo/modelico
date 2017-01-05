const cacheRegistry = new WeakMap()

// memoise for unary (on purpose) functions
export default fn => arg => {
  if (!cacheRegistry.has(fn)) {
    cacheRegistry.set(fn, new WeakMap())
  }

  const cache = cacheRegistry.get(fn)

  if (!cache.has(arg)) {
    cache.set(arg, fn(arg))
  }

  return cache.get(arg)
}
