import { T, identity } from './U'
import getSchema from './getSchema'
import M from './'

const formatError = (ajv, schema, value, path = []) => [
  'Invalid JSON at "' + path.join(' > ') + '". According to the schema' + '\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the value\n',
  JSON.stringify(value, null, 2) + '\n',
  ajv.errors[0].message
].join('\n')

const formatDefaultValueError = (ajv, schema, value) => [
  'Invalid default value. According to the schema' + '\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the default value\n',
  JSON.stringify(value, null, 2) + '\n',
  ajv.errors[0].message
].join('\n')

export default (ajv = { validate: T }) => {
  const {
    _,
    asIs,
    any,
    string,
    number,
    boolean,
    date,
    enumMap,
    list,
    map,
    stringMap,
    set,
    maybe,
    withDefault
  } = M.metadata()

  const ensure = (metadata, schema, valueTransformer = identity) => (k, value, path) => {
    if (k !== '') {
      return value
    }

    const valid = ajv.validate(schema, valueTransformer(value))

    if (!valid) {
      throw TypeError(formatError(ajv, schema, value, path))
    }

    return metadata.reviver('', value, path)
  }

  const ensureWrapped = (metadata, schema1, schema2) => (k, value) => {
    if (k !== '') {
      return value
    }

    const unwrappedValue = ensure(metadata, schema1)(k, value)

    return ensure(any(), schema2, x => x.inner())(k, unwrappedValue)
  }

  const ajvMeta = (meta, baseSchema, mainSchema = {}, innerSchema = {}) => {
    const schemaToCheck = Object.assign({}, baseSchema, mainSchema)
    const reviver = ensure(meta, schemaToCheck)

    const schema = Object.assign({}, schemaToCheck, innerSchema)

    return Object.assign({}, meta, { reviver, schema })
  }

  const ajv_ = (Type, schema = {}, path, innerMetadata) => {
    const metadata = _(Type, path, innerMetadata)

    return ajvMeta(metadata, {}, schema, getSchema(metadata))
  }

  const ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema)

  const ajvAny = schema => ajvAsIs(schema)

  const ajvNumber = (schema, options = {}) => {
    const { wrap = false } = options
    const meta = number(options)

    if (!wrap) {
      return ajvMeta(meta, { type: 'number' }, schema)
    }

    const numberMeta = Object.assign({ type: 'number' }, schema)

    const reviver = ensureWrapped(meta, {
      anyOf: [
        { type: 'number' },
        { type: 'string', enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }
      ]
    }, numberMeta)

    return Object.assign({}, meta, { reviver, schema: numberMeta })
  }

  const ajvString = schema =>
    ajvMeta(string(), { type: 'string' }, schema)

  const ajvBoolean = schema =>
    ajvMeta(boolean(), { type: 'boolean' }, schema)

  const ajvDate = schema =>
    ajvMeta(date(), { type: 'string', format: 'date-time' }, schema)

  const ajvEnumMap = (schema, keyMetadata, valueMetadata) =>
    ajvMeta(enumMap(keyMetadata, valueMetadata), {
      type: 'object',
      maxProperties: Object.keys(keyMetadata).length
    }, schema, { properties: getSchema(valueMetadata) })

  const ajvList = (schema, itemMetadata) =>
    ajvMeta(list(itemMetadata), { type: 'array' }, schema, { items: getSchema(itemMetadata) })

  const ajvMap = (schema, keyMetadata, valueMetadata) => {
    const baseSchema = {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    }

    const keyValueSchema = {
      items: Object.assign({
        items: [
          getSchema(keyMetadata),
          getSchema(valueMetadata)
        ]
      }, baseSchema.items)
    }

    return ajvMeta(map(keyMetadata, valueMetadata), baseSchema, schema, keyValueSchema)
  }

  const ajvStringMap = (schema, valueMetadata) =>
    ajvMeta(stringMap(valueMetadata), { type: 'object' }, schema, { properties: getSchema(valueMetadata) })

  const ajvSet = (schema, itemMetadata) =>
    ajvMeta(set(itemMetadata), { type: 'array', uniqueItems: true }, schema, { items: getSchema(itemMetadata) })

  const ajvMaybe = (itemMetadata) =>
    ajvMeta(maybe(itemMetadata), {}, {}, getSchema(itemMetadata))

  const ajvWithDefault = (metadata, defaultValue) => {
    const schema = getSchema(metadata)
    const valid = ajv.validate(schema, defaultValue)

    if (!valid) {
      throw TypeError(formatDefaultValueError(ajv, schema, defaultValue))
    }

    return ajvMeta(withDefault(metadata, defaultValue), {}, {}, schema)
  }

  return Object.freeze({
    ajv_,
    ajvAsIs,
    ajvAny,
    ajvNumber,
    ajvString,
    ajvBoolean,
    ajvDate,
    ajvEnumMap,
    ajvList,
    ajvMap,
    ajvStringMap,
    ajvSet,
    ajvMaybe,
    ajvWithDefault
  })
}
