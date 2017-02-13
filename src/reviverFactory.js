import { isPlainObject, reviverOrAsIs, isFunction } from './U'
import getInnerTypes from './getInnerTypes'

const plainObjectReviverFactory = (Type, k, v, prevPath) =>
  Object.keys(v).reduce((acc, field) => {
    const path = prevPath.concat(field)
    const innerTypes = getInnerTypes(prevPath, Type)

    const metadataCandidate = innerTypes[field]
    const metadata = isFunction(metadataCandidate)
      ? metadataCandidate(v, path)
      : metadataCandidate

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field], path)
    } else {
      acc[field] = v[field]
    }

    return acc
  }, {})

const reviverFactory = Type => (k, v, path = []) => {
  if (k !== '') {
    return v
  }

  const fields = isPlainObject(v)
    ? plainObjectReviverFactory(Type, k, v, path)
    : v

  return new Type(fields)
}

export default reviverFactory
