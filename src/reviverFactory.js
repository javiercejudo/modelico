import { isPlainObject, reviverOrAsIs } from './U'
import getInnerTypes from './getInnerTypes'

const plainObjectReviverFactory = (Type, k, v, prevPath) =>
  Object.keys(v).reduce((acc, field) => {
    const path = prevPath.concat(field)
    const innerTypes = getInnerTypes(path, Type)

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
