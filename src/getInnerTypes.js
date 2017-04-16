// @flow

import {emptyObject} from './U'

type Path = Array<string | number>

type ModelicoModel = {
  innerTypes(Path, ModelicoModel): Object
}

const innerTypesCache: WeakMap<Object, ModelicoModel> = new WeakMap()

const getInnerTypes = (path: Path, Type: ModelicoModel): Object => {
  return Type.innerTypes(path, Type)
}

export default (path: Path, Type: ModelicoModel): Object => {
  if (!innerTypesCache.has(Type)) {
    innerTypesCache.set(Type, getInnerTypes(path, Type))
  }

  return innerTypesCache.get(Type) || emptyObject
}
