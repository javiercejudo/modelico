const innerTypesCache = new WeakMap()

const getInnerTypes = (path, Type) => {
  return Type.innerTypes(path, Type)
}

export default (path, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type))
  }

  return innerTypesCache.get(Type)
}
