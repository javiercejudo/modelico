// @flow

import M from './'
import {emptyObject} from './U'
import getInnerTypes from './getInnerTypes'

const metadataSchemaCache = new WeakMap()

let state
const defaultState = () => ({
  nextRef: 1,
  definitions: {},
  usedDefinitions: new Set(),
  metadataRefCache: new WeakMap()
})

const getSchemaImpl = (metadata: Object) => {
  if (metadata.schema) {
    return metadata.schema()
  }

  const hasInnerTypes = metadata.type && metadata.type.innerTypes

  const innerTypes = hasInnerTypes
    ? getInnerTypes([], metadata.type)
    : emptyObject

  if (Object.keys(innerTypes).length === 0) {
    return emptyObject
  }

  const baseSchema = {type: 'object'}

  const required = []
  const properties = Object.keys(innerTypes).reduce((acc, fieldName) => {
    const fieldMetadata = innerTypes[fieldName]
    const fieldSchema = getSchema(fieldMetadata, false)
    let schema

    if (fieldMetadata.default === undefined) {
      required.push(fieldName)
      schema = fieldSchema
    } else {
      schema = Object.assign(
        {},
        {
          anyOf: [{type: 'null'}, fieldSchema]
        },
        fieldMetadata.type === M.Maybe
          ? undefined
          : {default: fieldMetadata.default}
      )
    }

    return Object.assign(acc, {[fieldName]: schema})
  }, {})

  const schema = Object.assign({}, baseSchema, {properties})

  if (required.length > 0) {
    schema.required = required
  }

  return schema
}

const getUsedDefinitions = () => {
  const {definitions, usedDefinitions} = state

  return Object.keys(definitions).map(Number).reduce((acc, ref) => {
    if (usedDefinitions.has(ref)) {
      acc[ref] = definitions[ref]
    }

    return acc
  }, {})
}

const getSchema = (metadata: Object, topLevel: boolean = true) => {
  if (metadataSchemaCache.has(metadata)) {
    return metadataSchemaCache.get(metadata)
  }

  if (topLevel) {
    state = defaultState()
  }

  if (state.metadataRefCache.has(metadata)) {
    const ref = state.metadataRefCache.get(metadata) || state.nextRef
    state.usedDefinitions.add(ref)
    return {$ref: `#/definitions/${ref}`}
  }

  const ref = state.nextRef

  state.metadataRefCache.set(metadata, ref)
  state.nextRef += 1

  const schema = getSchemaImpl(metadata)

  Object.assign(state.definitions, {[ref]: schema})

  if (!topLevel) {
    const ref = state.metadataRefCache.get(metadata)
    const schemaKeys = Object.keys(schema)

    if (
      !ref ||
      (schemaKeys.length <= 1 && !Array.isArray(schema[schemaKeys[0]]))
    ) {
      return schema
    }

    state.usedDefinitions.add(ref)
    return {$ref: `#/definitions/${ref}`}
  }

  const definitions = getUsedDefinitions()
  let finalSchema

  if (Object.keys(definitions).length === 0) {
    finalSchema = schema
  } else if (!definitions.hasOwnProperty(ref)) {
    finalSchema = Object.assign({}, schema, {definitions})
  } else {
    finalSchema = {
      definitions: Object.assign(definitions, {
        [ref]: schema
      }),
      $ref: `#/definitions/${ref}`
    }
  }

  metadataSchemaCache.set(metadata, finalSchema)

  return finalSchema
}

export default getSchema
