import {isPlainObject} from './U'

const isMatch = obj => meta => {
  const innerTypes = meta.type.innerTypes()
  const innerTypesKeys = Object.keys(innerTypes)
  const objIsPlainObject = isPlainObject(obj)

  if (innerTypesKeys.length === 0 && objIsPlainObject) {
    return false
  }

  return innerTypesKeys
    .filter(propName => !innerTypes[propName].hasOwnProperty('default'))
    .every(
      propName => (objIsPlainObject ? obj.hasOwnProperty(propName) : false)
    )
}

const inferClassifier = metas => obj => {
  const matches = metas.filter(isMatch(obj), [])

  if (matches.length === 0) {
    throw Error('Unable to infer type')
  }

  if (matches.length > 1) {
    throw Error(
      'Ambiguous object: more than one metadata matches the object. ' +
        'A custom classifier can be passed as a second argument.'
    )
  }

  return matches[0]
}

export default inferClassifier
