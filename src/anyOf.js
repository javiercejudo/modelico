import { typeSymbol } from './symbols'
import any from './any'

export default (conditionedMetas = [], enumField = 'type') => (v, path) => {
  if (conditionedMetas.length === 0) {
    return any
  }

  const Enum = conditionedMetas[0][1][typeSymbol]()
  const enumeratorToMatch = Enum.metadata().reviver('', v[enumField])

  for (let i = 0; i < conditionedMetas.length; i += 1) {
    const conditionedMeta = conditionedMetas[i]
    const metadata = conditionedMeta[0]
    const enumerator = conditionedMeta[1]

    if (enumeratorToMatch === enumerator) {
      return metadata
    }
  }

  const prevPath = path.slice(0, -1)

  throw TypeError(`unsupported enumerator "${enumeratorToMatch.toJSON()}" at "${prevPath.join(' > ')}"`)
}
