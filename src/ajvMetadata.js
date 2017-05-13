import {T, identity, always, emptyObject, isFunction, isPlainObject} from './U'
import M from './'

const getInnerSchema = metadata => M.getSchema(metadata, false)

const formatError = (ajv, schema, value, path = []) =>
  [
    'Invalid JSON at "' + path.join(' -> ') + '". According to the schema\n',
    JSON.stringify(schema, null, 2) + '\n',
    'the value (data path "' +
      ajv.errors.filter(e => e.dataPath !== '').map(error => error.dataPath) +
      '")\n',
    JSON.stringify(value, null, 2) + '\n'
  ]
    .concat(ajv.errors.map(error => error.message))
    .join('\n')

export default (ajv = {validate: T}) => {
  const getSchema = M.getSchema
  const metadata = M.metadata()
  const ajvMetadata = {}

  const {
    _,
    base,
    asIs,
    any,
    anyOf,
    union,
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
  } = metadata

  const ensure = (
    metadata,
    schema,
    valueTransformer = identity,
    reviverName = 'reviver'
  ) => (k, value, path) => {
    if (k !== '') {
      return value
    }

    const valid = schema === emptyObject
      ? true
      : ajv.validate(schema, valueTransformer(value))

    if (!valid) {
      throw TypeError(formatError(ajv, schema, value, path))
    }

    const resolvedMetadata = isFunction(metadata)
      ? metadata(value, path)
      : metadata

    return resolvedMetadata[reviverName]('', value, path)
  }

  const ensureWrapped = (metadata, schema1, schema2, reviverName) => (
    k,
    value
  ) => {
    if (k !== '') {
      return value
    }

    const unwrappedValue = ensure(metadata, schema1, identity, reviverName)(
      k,
      value
    )

    return ensure(any(), schema2, x => x.inner(), reviverName)(
      k,
      unwrappedValue
    )
  }

  const ajvMeta = (
    metadata,
    baseSchema,
    mainSchema = emptyObject,
    innerSchemaGetter = always(emptyObject)
  ) => {
    const schemaToCheck = baseSchema === emptyObject &&
      mainSchema === emptyObject
      ? emptyObject
      : Object.assign({}, baseSchema, mainSchema)

    const reviver = ensure(metadata, schemaToCheck)

    const maybeReviver = metadata.maybeReviver
      ? ensure(metadata, schemaToCheck, identity, 'maybeReviver')
      : reviver

    const schemaGetter = () =>
      Object.assign({}, schemaToCheck, innerSchemaGetter())

    const baseMetadata = isFunction(metadata) ? {type: metadata} : metadata

    return Object.assign({}, baseMetadata, {
      baseMetadata,
      reviver,
      maybeReviver,
      ownSchema: always(schemaToCheck),
      schema: schemaGetter
    })
  }

  ajvMetadata.ajvMeta = ajvMeta

  ajvMetadata.ajv_ = (
    Type,
    schema = emptyObject,
    innerMetadata,
    topLevel = false
  ) => {
    const metadata = _(Type, innerMetadata)

    return ajvMeta(metadata, emptyObject, schema, () =>
      getSchema(metadata, topLevel)
    )
  }

  ajvMetadata.ajvBase = (Type, schema = emptyObject, topLevel = false) => {
    const metadata = base(Type)

    return ajvMeta(metadata, {type: 'object'}, schema, () =>
      getSchema(metadata, topLevel)
    )
  }

  ajvMetadata.ajvAsIs = (schema, transformer = identity) =>
    ajvMeta(asIs(transformer), schema)

  ajvMetadata.ajvAny = schema => ajvMetadata.ajvAsIs(schema)

  ajvMetadata.ajvNumber = (schema, options = emptyObject) => {
    const {wrap = false} = options
    const metadata = number(options)

    if (!wrap) {
      return ajvMeta(metadata, {type: 'number'}, schema)
    }

    const numberMeta = Object.assign({type: 'number'}, schema)

    const baseSchema = {
      anyOf: [{type: 'number'}, {enum: ['-0', '-Infinity', 'Infinity', 'NaN']}]
    }

    const reviver = ensureWrapped(metadata, baseSchema, numberMeta)

    return Object.assign({}, metadata, {
      reviver,
      ownSchema: always(numberMeta),
      schema: always(numberMeta)
    })
  }

  ajvMetadata.ajvString = schema => ajvMeta(string(), {type: 'string'}, schema)

  ajvMetadata.ajvBoolean = schema =>
    ajvMeta(boolean(), {type: 'boolean'}, schema)

  ajvMetadata.ajvDate = schema =>
    ajvMeta(date(), {type: 'string', format: 'date-time'}, schema)

  ajvMetadata.ajvEnum = Type => {
    const metadata = _(Type)

    return ajvMeta(metadata, {
      enum: Object.keys(metadata.enumerators)
    })
  }

  ajvMetadata.ajvEnumMap = (keyMetadata, valueMetadata, schema) => {
    const enumeratorsKeys = Object.keys(keyMetadata.enumerators)
    const keysRegex = `^(${enumeratorsKeys.join('|')})$`

    return ajvMeta(
      enumMap(keyMetadata, valueMetadata),
      {
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
          [keysRegex]: getInnerSchema(valueMetadata, false)
        }
      })
    )
  }

  const ajvList = (itemMetadata, schema) =>
    ajvMeta(list(itemMetadata), {type: 'array'}, schema, () => ({
      items: getInnerSchema(itemMetadata)
    }))

  const ajvTuple = (itemsMetadata, schema) => {
    const length = itemsMetadata.length

    return ajvMeta(
      list(itemsMetadata),
      {
        type: 'array',
        minItems: length,
        maxItems: length
      },
      schema,
      () => ({
        items: itemsMetadata.map(itemMetadata => getInnerSchema(itemMetadata))
      })
    )
  }

  ajvMetadata.ajvList = (itemMetadata, schema) =>
    Array.isArray(itemMetadata)
      ? ajvTuple(itemMetadata, schema)
      : ajvList(itemMetadata, schema)

  ajvMetadata.ajvMap = (keyMetadata, valueMetadata, schema) => {
    const baseSchema = {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2
      }
    }

    const keyValueSchemaGetter = () => ({
      items: Object.assign(
        {
          items: [getInnerSchema(keyMetadata), getInnerSchema(valueMetadata)]
        },
        baseSchema.items
      )
    })

    return ajvMeta(
      map(keyMetadata, valueMetadata),
      baseSchema,
      schema,
      keyValueSchemaGetter
    )
  }

  ajvMetadata.ajvStringMap = (valueMetadata, schema) =>
    ajvMeta(stringMap(valueMetadata), {type: 'object'}, schema, () => ({
      additionalProperties: false,
      patternProperties: {
        '.*': getInnerSchema(valueMetadata)
      }
    }))

  ajvMetadata.ajvSet = (itemMetadata, schema) =>
    ajvMeta(
      set(itemMetadata),
      {
        type: 'array',
        uniqueItems: true
      },
      schema,
      () => ({items: getInnerSchema(itemMetadata)})
    )

  ajvMetadata.ajvMaybe = itemMetadata =>
    ajvMeta(maybe(itemMetadata), emptyObject, emptyObject, () =>
      getInnerSchema(itemMetadata)
    )

  ajvMetadata.ajvAnyOf = (conditionedMetas, enumField) =>
    ajvMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(conditionMeta =>
        getInnerSchema(conditionMeta[0])
      )
    })

  ajvMetadata.ajvUnion = (Type, metasOrTypes, classifier) => {
    const metas = metasOrTypes.map(x => (isPlainObject(x) ? x : _(x)))
    const baseMetadata = union(Type, metas, classifier)

    return ajvMeta(baseMetadata, emptyObject, emptyObject, () => ({
      // The classifier might determine how multiple matches resolve, hence the
      // use of anyOf instead of oneOf. Ambiguities will still be caught.
      anyOf: metas.map(getInnerSchema)
    }))
  }

  return Object.freeze(Object.assign(ajvMetadata, metadata))
}
