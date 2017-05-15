import {emptyObject, isFunction} from './U'
import metadataFactory from './metadata'
import Base from './Base'

const metadata = metadataFactory()

const createModel = (
  innerTypes = emptyObject,
  {base = Base, stringTag = 'ModelicoModel', metadata: m = metadata} = {}
) => {
  const Model = class extends base {
    constructor() {
      const args = arguments

      if (args.length === 2) {
        super(args[0], args[1])
      } else {
        const propsCandidate = args[0]
        const props = propsCandidate === undefined ? {} : propsCandidate
        super(Model, props)
      }
    }

    get [Symbol.toStringTag]() {
      return stringTag
    }

    static innerTypes(path, Type) {
      return isFunction(innerTypes)
        ? innerTypes(m, {path, Type})
        : Object.freeze(innerTypes)
    }
  }

  Model.displayName = stringTag

  return Model
}

export default createModel
