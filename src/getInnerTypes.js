const innerTypesCache = new WeakMap()

const getInnerTypes = (path/* : Array<any> */, Type/* : Function */) => {
  if (!Type.innerTypes) {
    throw Error(`missing static innerTypes for ${Type.displayName || Type.name}`)
  }

  return Type.innerTypes(path, Type)
}

export default (path, Type) => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type))
  }

  return innerTypesCache.get(Type)
}
