import {T, formatAjvError, mem, partial} from '../U'
import jsonSchemaMetadata from './jsonSchemaMetadata'

const ajvMetadata = mem((ajv = {validate: T}) => {
  const validate = (schema, value) => [
    ajv.validate(schema, value),
    partial(formatAjvError, ajv, schema, value)
  ]

  return jsonSchemaMetadata(validate)
})

export default ajvMetadata
