import { isPlainObject, reviverOrAsIs, getInnerTypes } from './U'

const innerTypesCache = new WeakMap()

const getInnerTypesWithCache = (path, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type))
  }

  return innerTypesCache.get(Type)
}

const plainObjectReviverFactory = (Type, k, v, prevPath) =>
  Object.keys(v).reduce((acc, field) => {
    const path = prevPath.concat(field)
    const innerTypes = getInnerTypesWithCache(path, Type)

    const metadata = innerTypes[field]

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field], path)
    } else {
      acc[field] = v[field]
    }

    return acc
  }, {})

const reviverFactory = (path, Type) => (k, v) => {
  if (k !== '') {
    return v
  }

  const fields = isPlainObject(v)
    ? plainObjectReviverFactory(Type, k, v, path)
    : v

  return new Type(fields)
}

export default reviverFactory
