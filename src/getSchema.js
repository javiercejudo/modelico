import M from './'
import { emptyObject } from './U'
import getInnerTypes from './getInnerTypes'

const metadataSchemaCache = new WeakMap()
const metadataRefCache = new WeakMap()

const state = {
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set()
}

const getSchemaImpl = metadata => {
  if (metadata.schema) {
    return metadata.schema()
  }

  if (
    !metadata.type || !metadata.type.innerTypes ||
    Object.keys(getInnerTypes([], metadata.type)).length === 0
  ) {
    return emptyObject
  }

  const baseSchema = { type: 'object' }
  const innerTypes = metadata.type.innerTypes()

  const required = []
  const properties = Object.keys(innerTypes).reduce((acc, fieldName) => {
    const fieldMetadata = innerTypes[fieldName]
    const fieldSchema = getSchema(fieldMetadata, false)
    let schema

    if (fieldMetadata.default === undefined) {
      required.push(fieldName)
      schema = fieldSchema
    } else {
      schema = Object.assign({
        anyOf: [
          { type: 'null' },
          fieldSchema
        ]
      }, (fieldMetadata.type === M.Maybe) ? undefined : { default: fieldMetadata.default })
    }

    return Object.assign(acc, {[fieldName]: schema})
  }, {})

  const schema = Object.assign({}, baseSchema, { properties })

  if (required.length > 0) {
    schema.required = required
  }

  return schema
}

const getUsedDefinitions = () => {
  const { definitions, usedDefinitions } = state

  return Object.keys(definitions).map(Number).reduce((acc, ref) => {
    if (usedDefinitions.has(ref)) {
      acc[ref] = definitions[ref]
    }

    return acc
  }, {})
}

const schemaDeclaration = (schema, specification) =>
  (specification !== '')
    ? Object.assign({'$schema': specification}, schema)
    : schema

const getSchema = (metadata, topLevel = true, specification = '') => {
  if (metadataSchemaCache.has(metadata)) {
    return schemaDeclaration(metadataSchemaCache.get(metadata), specification)
  }

  if (metadataRefCache.has(metadata)) {
    const ref = metadataRefCache.get(metadata)
    state.usedDefinitions.add(ref)
    return { $ref: `#/definitions/${ref}` }
  }

  if (topLevel) {
    state.nextRef = 1
    state.definitions = {}
    state.usedDefinitions = new Set()
  }

  const ref = state.nextRef

  metadataRefCache.set(metadata, ref)
  state.nextRef += 1

  const schema = getSchemaImpl(metadata)
  metadataSchemaCache.set(metadata, schema)

  Object.assign(state.definitions, { [ref]: schema })

  if (!topLevel) {
    return schema
  }

  const definitions = getUsedDefinitions()

  if (Object.keys(definitions).length === 0) {
    return schemaDeclaration(schema, specification)
  }

  return schemaDeclaration({
    definitions: Object.assign(definitions, { [ref]: schema }),
    $ref: `#/definitions/${ref}`
  }, specification)
}

export default getSchema
