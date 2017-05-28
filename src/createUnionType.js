import {isFunction, isPlainObject} from './U'
import {typeSymbol} from './symbols'
import metadataFactory from './metadata/metadata'
import inferUnionClassifier from './inferUnionClassifier'
import M from './'

const {union: defaultUnion} = metadataFactory()

const createUnionType = (metasOrTypes, classifier, union = defaultUnion) => {
  const metas = metasOrTypes.map(
    x => (isPlainObject(x) && !(x instanceof M.Enum) ? x : M.metadata()._(x))
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

      return (instance, def) => {
        const typeGetter = instance[typeSymbol]
        const Type = typeGetter ? typeGetter() : instance.constructor
        const typeCaseCandidate = casesMap.get(Type)

        const typeCase = typeCaseCandidate !== undefined
          ? typeCaseCandidate
          : def

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
