import { T, identity, always, emptyObject } from './U'
import getSchema from './getSchema'
import M from './'

const formatError = (ajv, schema, value, path = []) => [
  'Invalid JSON at "' + path.join(' > ') + '". According to the schema\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the value\n',
  JSON.stringify(value, null, 2) + '\n',
  ajv.errors[0].message
].join('\n')

const formatDefaultValueError = (ajv, schema, value) => [
  'Invalid default value. According to the schema\n',
  JSON.stringify(schema, null, 2) + '\n',
  'the default value\n',
  JSON.stringify(value, null, 2) + '\n',
  ajv.errors[0].message
].join('\n')

export default (ajv = { validate: T }) => {
  const metadata = M.metadata()
  const ajvMetadata = {}

  const {
    _,
    base,
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
  } = metadata

  const ensure = (metadata, schema, valueTransformer = identity) => (k, value, path) => {
    if (k !== '') {
      return value
    }

    const valid = (schema === emptyObject)
      ? true
      : ajv.validate(schema, valueTransformer(value))

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

  const ajvMeta = (meta, baseSchema, mainSchema = emptyObject, innerSchemaGetter = always(emptyObject)) => {
    const schemaToCheck = (baseSchema === emptyObject && mainSchema === emptyObject)
      ? emptyObject
      : Object.assign({}, baseSchema, mainSchema)

    const reviver = ensure(meta, schemaToCheck)

    const schemaGetter = () => Object.assign({}, schemaToCheck, innerSchemaGetter())

    return Object.assign({}, meta, { reviver, ownSchema: always(schemaToCheck), schema: schemaGetter })
  }

  ajvMetadata.ajv_ = (Type, schema = emptyObject, innerMetadata) => {
    const metadata = _(Type, innerMetadata)

    return ajvMeta(metadata, emptyObject, schema, () => getSchema(metadata))
  }

  ajvMetadata.ajvBase = (Type, schema = emptyObject) => {
    const metadata = base(Type)

    return ajvMeta(metadata, { type: 'object' }, schema, () => getSchema(metadata))
  }

  ajvMetadata.ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema)

  ajvMetadata.ajvAny = schema => ajvMetadata.ajvAsIs(schema)

  ajvMetadata.ajvNumber = (schema, options = emptyObject) => {
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

    return Object.assign({}, meta, { reviver, ownSchema: always(numberMeta), schema: always(numberMeta) })
  }

  ajvMetadata.ajvString = schema =>
    ajvMeta(string(), { type: 'string' }, schema)

  ajvMetadata.ajvBoolean = schema =>
    ajvMeta(boolean(), { type: 'boolean' }, schema)

  ajvMetadata.ajvDate = schema =>
    ajvMeta(date(), { type: 'string', format: 'date-time' }, schema)

  ajvMetadata.ajvEnumMap = (schema, keyMetadata, valueMetadata) => {
    const enumeratorsKeys = Object.keys(keyMetadata.enumerators)
    const keysRegex = `^(${enumeratorsKeys.join('|')})$`

    return ajvMeta(
      enumMap(keyMetadata, valueMetadata), {
        type: 'object',
        maxProperties: enumeratorsKeys.length,
        additionalProperties: false,
        patternProperties: {
          [keysRegex]: {}
        }
      },
      schema,
      () => ({
        patternProperties: {
          [keysRegex]: getSchema(valueMetadata)
        }
      })
    )
  }

  ajvMetadata.ajvList = (schema, itemMetadata) =>
    ajvMeta(list(itemMetadata), { type: 'array' }, schema, () => ({ items: getSchema(itemMetadata) }))

  ajvMetadata.ajvMap = (schema, keyMetadata, valueMetadata) => {
    const baseSchema = {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    }

    const keyValueSchemaGetter = () => ({
      items: Object.assign({
        items: [
          getSchema(keyMetadata),
          getSchema(valueMetadata)
        ]
      }, baseSchema.items)
    })

    return ajvMeta(map(keyMetadata, valueMetadata), baseSchema, schema, keyValueSchemaGetter)
  }

  ajvMetadata.ajvStringMap = (schema, valueMetadata) =>
    ajvMeta(
      stringMap(valueMetadata),
      { type: 'object' },
      schema,
      () => ({
        additionalProperties: false,
        patternProperties: { '.*': getSchema(valueMetadata) }
      })
    )

  ajvMetadata.ajvSet = (schema, itemMetadata) =>
    ajvMeta(set(itemMetadata), { type: 'array', uniqueItems: true }, schema, () => ({ items: getSchema(itemMetadata) }))

  ajvMetadata.ajvMaybe = (itemMetadata) =>
    ajvMeta(maybe(itemMetadata), emptyObject, emptyObject, () => getSchema(itemMetadata))

  ajvMetadata.ajvWithDefault = (metadata, defaultValue) => {
    const schema = getSchema(metadata)
    const valid = ajv.validate(schema, defaultValue)

    if (!valid) {
      throw TypeError(formatDefaultValueError(ajv, schema, defaultValue))
    }

    return ajvMeta(withDefault(metadata, defaultValue), emptyObject, emptyObject, always(schema))
  }

  return Object.freeze(Object.assign(ajvMetadata, metadata))
}
