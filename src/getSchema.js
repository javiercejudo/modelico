import M from './'
import { emptyObject } from './U'
import getInnerTypes from './getInnerTypes'

const metadataSchemaCache = new WeakMap()

const schemaDeclaration = (schema, specification) =>
  (specification !== '')
    ? Object.assign({'$schema': specification}, schema)
    : schema

const getSchema = metadata => {
  if (metadata.schema) {
    return metadata.schema()
  }

  if (!metadata.type.innerTypes || Object.keys(getInnerTypes([], metadata.type)).length === 0) {
    return emptyObject
  }

  const baseSchema = { type: 'object' }
  const innerTypes = metadata.type.innerTypes()

  const required = []
  const properties = Object.keys(innerTypes).reduce((acc, fieldName) => {
    const fieldMetadata = innerTypes[fieldName]
    const schema = getSchema(fieldMetadata)

    if (fieldMetadata.type !== M.Maybe && fieldMetadata.default === undefined) {
      required.push(fieldName)
    }

    return Object.assign(acc, {[fieldName]: schema})
  }, {})

  const schema = Object.assign({}, baseSchema, { properties })

  if (required.length > 0) {
    schema.required = required
  }

  return schema
}

export default (metadata, specification = '') => {
  if (!metadataSchemaCache.has(metadata)) {
    metadataSchemaCache.set(metadata, getSchema(metadata))
  }

  return schemaDeclaration(metadataSchemaCache.get(metadata), specification)
}
