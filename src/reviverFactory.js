// @flow

import {isPlainObject, reviverOrAsIs, isFunction} from './U'
import getInnerTypes from './getInnerTypes'

type Path = Array<string | number>

const plainObjectReviverFactory = (
  Type: any,
  k: string,
  v: any,
  prevPath: Path
) =>
  Object.keys(v).reduce((acc, field) => {
    const path = prevPath.concat(field)
    const innerTypes = getInnerTypes(prevPath, Type)

    const metadataCandidate = innerTypes[field]
    const metadata = isFunction(metadataCandidate)
      ? metadataCandidate(v, path)
      : metadataCandidate

    if (metadata) {
      acc[field] = reviverOrAsIs(metadata)(k, v[field], path, Type)
    } else {
      acc[field] = v[field]
    }

    return acc
  }, {})

const reviverFactory = (Type: any) => (k: string, v: any, path: Path = []) => {
  if (k !== '') {
    return v
  }

  const fields = isPlainObject(v)
    ? plainObjectReviverFactory(Type, k, v, path)
    : v

  return new Type(fields)
}

export default reviverFactory
