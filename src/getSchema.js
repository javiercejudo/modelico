import M from './'

export default metadata => {
  if (metadata.schema) {
    return metadata.schema
  }

  const baseSchema = { type: 'object' }

  if (!metadata.type.innerTypes || Object.keys(metadata.type.innerTypes()).length === 0) {
    return baseSchema
  }

  const innerTypes = metadata.type.innerTypes()

  const required = []
  const properties = Object.keys(innerTypes).reduce((acc, fieldName) => {
    const fieldMetadata = innerTypes[fieldName]
    const schema = fieldMetadata.schema || {}

    if (fieldMetadata.type !== M.Maybe) {
      required.push(fieldName)
    }

    return Object.assign(acc, {[fieldName]: schema})
  }, {})

  return Object.assign({}, baseSchema, { properties, required })
}
