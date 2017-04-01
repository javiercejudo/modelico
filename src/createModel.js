import { emptyObject, isFunction } from './U'
import metadataFactory from './metadata'
import Base from './Base'

const metadata = metadataFactory()

const createModel = (
  innerTypes = emptyObject,
  {
    base = Base,
    stringTag = 'ModelicoModel',
    metadata: m = metadata
  } = {}
) => {
  return class extends base {
    get [Symbol.toStringTag] () {
      return stringTag
    }

    static innerTypes (path, Type) {
      return isFunction(innerTypes)
        ? innerTypes(m, {path, Type})
        : Object.freeze(innerTypes)
    }
  }
}

export default createModel
