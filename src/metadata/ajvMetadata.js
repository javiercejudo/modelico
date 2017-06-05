import {formatAjvError, mem, partial} from '../U'
import jsonSchemaMetadata from './jsonSchemaMetadata'

const ajvMetadata = mem(ajv => {
  const validate = (schema, value, path) => [
    ajv.validate(schema, value),
    partial(formatAjvError, ajv, schema, value, path)
  ]

  return jsonSchemaMetadata(ajv === undefined ? undefined : validate)
})

export default ajvMetadata
