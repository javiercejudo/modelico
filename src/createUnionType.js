import {isFunction, isPlainObject} from './U'
import {typeSymbol} from './symbols'
import metadataFactory from './metadata'
import inferUnionClassifier from './inferUnionClassifier'
import M from './'

const {union} = metadataFactory()

const createUnionType = (metasOrTypes, classifier) => {
  const metas = metasOrTypes.map(
    x => (isPlainObject(x) ? x : M.metadata()._(x))
  )

  classifier = classifier === undefined
    ? inferUnionClassifier(metas)
    : classifier

  const metasCount = metas.length

  class UnionType extends M.Base {
    static caseOf(...cases) {
      const casesMap = new Map(cases)
      const casesCount = casesMap.size

      if (metasCount !== casesCount) {
        throw Error(`caseOf expected ${metasCount} but contains ${casesCount}`)
      }

      if (!metas.every(meta => casesMap.has(meta.type))) {
        throw Error('caseOf does not cover all cases')
      }

      return instance => {
        const Type = instance[typeSymbol]()
        const typeCase = casesMap.get(Type)

        return isFunction(typeCase) ? typeCase(instance) : typeCase
      }
    }

    static metadata() {
      return union(UnionType, metas, classifier)
    }
  }

  return UnionType
}

export default createUnionType
