import { T, identity } from './U'
import M from './'

const formatError = (ajv, schema, value) => [
  'Invalid JSON: according to the schema' + '\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the value\n',
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
    maybe
  } = M.metadata()

  const ensure = (metadata, schema, valueTransformer = identity) => (k, value) => {
    if (k !== '') {
      return value
    }

    const valid = ajv.validate(schema, valueTransformer(value))

    if (!valid) {
      throw TypeError(formatError(ajv, schema, value))
    }

    return metadata.reviver('', value)
  }

  const ensureWrapped = (metadata, schema1, schema2) => (k, value) => {
    if (k !== '') {
      return value
    }

    const unwrappedValue = ensure(metadata, schema1)(k, value)

    return ensure(any(), schema2, x => x.inner())(k, unwrappedValue)
  }

  const ajvMeta = (meta, baseSchema, mainSchema = {}) => {
    const schema = Object.assign({}, baseSchema, mainSchema)
    const reviver = ensure(meta, schema)

    return Object.assign({}, meta, { reviver })
  }

  const ajv_ = (Type, schema) =>
    ajvMeta(_(Type), schema)

  const ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema)

  const ajvAny = schema => ajvAsIs(schema)

  const ajvNumber = (schema, options = {}) => {
    const { wrap = false } = options
    const meta = number(options)

    if (!wrap) {
      return ajvMeta(meta, { type: 'number' }, schema)
    }

    const reviver = ensureWrapped(meta, {
      anyOf: [
        { type: 'number' },
        { type: 'string', enum: ['-0', '-Infinity', 'Infinity', 'NaN'] }
      ]
    }, Object.assign({}, { type: 'number' }, schema))

    return Object.assign({}, meta, { reviver })
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
    }, schema)

  const ajvList = (schema, itemMetadata) =>
    ajvMeta(list(itemMetadata), { type: 'array' }, schema)

  const ajvMap = (schema, keyMetadata, valueMetadata) =>
    ajvMeta(map(keyMetadata, valueMetadata), {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    }, schema)

  const ajvStringMap = (schema, valueMetadata) =>
    ajvMeta(stringMap(valueMetadata), { type: 'object' }, schema)

  const ajvSet = (schema, itemMetadata) =>
    ajvMeta(set(itemMetadata), { type: 'array', uniqueItems: true }, schema)

  return Object.freeze({
    _: ajv_,
    asIs: ajvAsIs,
    any: ajvAny,
    number: ajvNumber,
    string: ajvString,
    boolean: ajvBoolean,
    date: ajvDate,
    enumMap: ajvEnumMap,
    list: ajvList,
    map: ajvMap,
    stringMap: ajvStringMap,
    set: ajvSet,
    maybe
  })
}
