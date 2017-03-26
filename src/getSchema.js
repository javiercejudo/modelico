import M from './'
import { emptyObject } from './U'
import getInnerTypes from './getInnerTypes'

const metadataSchemaCache = new WeakMap()

const state = {
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set(),
  metadataRefCache: new WeakMap()
}

const getSchemaImpl = metadata => {
  if (metadata.schema) {
    return metadata.schema()
  }

  if (
    !metadata.type ||
    !metadata.type.innerTypes ||
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

const getSchema = (metadata, topLevel = true) => {
  if (topLevel) {
    if (metadataSchemaCache.has(metadata)) {
      return metadataSchemaCache.get(metadata)
    }

    state.nextRef = 1
    state.definitions = {}
    state.usedDefinitions = new Set()
    state.metadataRefCache = new WeakMap()
  }

  if (state.metadataRefCache.has(metadata)) {
    const ref = state.metadataRefCache.get(metadata)
    state.usedDefinitions.add(ref)
    return { $ref: `#/definitions/${ref}` }
  }

  const ref = state.nextRef

  state.metadataRefCache.set(metadata, ref)
  state.nextRef += 1

  const schema = getSchemaImpl(metadata)

  Object.assign(state.definitions, { [ref]: schema })

  if (!topLevel) {
    return schema
  }

  const definitions = getUsedDefinitions()

  const finalSchema = (() => {
    if (Object.keys(definitions).length === 0) {
      return schema
    }

    if (!definitions.hasOwnProperty(ref)) {
      return Object.assign(schema, {definitions})
    }

    return {
      definitions: Object.assign(definitions, { [ref]: schema }),
      $ref: `#/definitions/${ref}`
    }
  })()

  metadataSchemaCache.set(metadata, finalSchema)

  return finalSchema
}

export default getSchema
