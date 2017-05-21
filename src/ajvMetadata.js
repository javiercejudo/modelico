import {
  T,
  identity,
  always,
  emptyObject,
  formatAjvError,
  isFunction,
  metaOrTypeMapper
} from './U'

import M from './'

const cacheRegistry = new WeakMap()

const mem = f => (a, ...args) => {
  if (args.length > 0) {
    return f(a, ...args)
  }

  if (!cacheRegistry.has(f)) {
    cacheRegistry.set(f, new WeakMap())
  }

  const cache = cacheRegistry.get(f)
  const key = a === undefined ? emptyObject : a

  if (!cache.has(key)) {
    cache.set(key, f(a, ...args))
  }

  return cache.get(key)
}

const getInnerSchema = metadata => M.getSchema(metadata, false)

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
  ) => (k, value, path = []) => {
    if (k !== '') {
      return value
    }

    const valid = schema === emptyObject
      ? true
      : ajv.validate(schema, valueTransformer(value))

    if (!valid) {
      throw TypeError(formatAjvError(ajv, schema, value, path))
    }

    const resolvedMetadata = isFunction(metadata)
      ? metadata(value, path)
      : metadata

    return resolvedMetadata[reviverName]('', value, path)
  }

  const ensureWrapped = (metadata, schema1, schema2, reviverName) => (
    k,
    value,
    path = []
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
      unwrappedValue,
      path
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

    const schemaGetter = () =>
      Object.assign({}, schemaToCheck, innerSchemaGetter())

    const baseMetadata = isFunction(metadata) ? {type: metadata} : metadata

    const enhancedMeta = Object.assign({}, baseMetadata, {
      baseMetadata,
      reviver,
      ownSchema: always(schemaToCheck),
      schema: schemaGetter
    })

    if (metadata.maybeReviver) {
      enhancedMeta.maybeReviver = ensure(
        metadata,
        schemaToCheck,
        identity,
        'maybeReviver'
      )
    }

    return enhancedMeta
  }

  ajvMetadata.ajvMeta = ajvMeta

  ajvMetadata._ = (
    Type,
    innerMetadata,
    schema = emptyObject,
    topLevel = false
  ) => {
    const metadata = _(Type, innerMetadata)

    return schema === emptyObject
      ? metadata
      : ajvMeta(metadata, emptyObject, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  ajvMetadata.base = (Type, schema = emptyObject, topLevel = false) => {
    const metadata = base(Type)

    return schema === emptyObject
      ? metadata
      : ajvMeta(metadata, {type: 'object'}, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  ajvMetadata.asIs = (transformer, schema) => ajvMeta(asIs(transformer), schema)

  ajvMetadata.any = schema => ajvMetadata.asIs(identity, schema)

  const ajvPrimitiveNumber = mem(schema =>
    ajvMeta(number(), {type: 'number'}, schema)
  )

  ajvMetadata.number = (options = emptyObject, schema) => {
    const {wrap = false} = options

    if (!wrap) {
      return ajvPrimitiveNumber(schema)
    }

    const metadata = number(options)
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

  ajvMetadata.string = mem(schema =>
    ajvMeta(string(), {type: 'string'}, schema)
  )

  ajvMetadata.boolean = mem(schema =>
    ajvMeta(boolean(), {type: 'boolean'}, schema)
  )

  ajvMetadata.date = mem(schema =>
    ajvMeta(date(), {type: 'string', format: 'date-time'}, schema)
  )

  ajvMetadata._enum = mem(Type => {
    const metadata = _(Type)

    return ajvMeta(metadata, {
      enum: Object.keys(metadata.enumerators)
    })
  })

  ajvMetadata.enumMap = (keyMetadata, valueMetadata, schema) => {
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

  ajvMetadata.list = mem(
    (itemMetadata, schema) =>
      Array.isArray(itemMetadata)
        ? ajvTuple(itemMetadata, schema)
        : ajvList(itemMetadata, schema)
  )

  const ajvMapImpl = (keyMetadata, valueMetadata, schema) => {
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

  const ajvMap = mem(keyMetadata =>
    mem(valueMetadata =>
      mem(schema => ajvMapImpl(keyMetadata, valueMetadata, schema))
    )
  )

  ajvMetadata.map = (keyMetadata, valueMetadata, schema) =>
    ajvMap(keyMetadata)(valueMetadata)(schema)

  ajvMetadata.stringMap = mem((valueMetadata, schema) =>
    ajvMeta(stringMap(valueMetadata), {type: 'object'}, schema, () => ({
      additionalProperties: false,
      patternProperties: {
        '.*': getInnerSchema(valueMetadata)
      }
    }))
  )

  ajvMetadata.set = mem((itemMetadata, schema) =>
    ajvMeta(
      set(itemMetadata),
      {
        type: 'array',
        uniqueItems: true
      },
      schema,
      () => ({items: getInnerSchema(itemMetadata)})
    )
  )

  ajvMetadata.maybe = mem(itemMetadata =>
    ajvMeta(maybe(itemMetadata), emptyObject, emptyObject, () =>
      getInnerSchema(itemMetadata)
    )
  )

  ajvMetadata.anyOf = (conditionedMetas, enumField) =>
    ajvMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(conditionMeta =>
        getInnerSchema(conditionMeta[0])
      )
    })

  ajvMetadata.union = (Type, metasOrTypes, classifier) => {
    const metas = metasOrTypes.map(metaOrTypeMapper(_))
    const baseMetadata = union(Type, metas, classifier)

    return ajvMeta(baseMetadata, emptyObject, emptyObject, () => ({
      // The classifier might determine how multiple matches resolve, hence the
      // use of anyOf instead of oneOf. Ambiguities will still be caught.
      anyOf: metas.map(getInnerSchema)
    }))
  }

  return Object.freeze(Object.assign({}, metadata, ajvMetadata))
}
