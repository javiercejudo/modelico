import {
  T,
  identity,
  always,
  emptyObject,
  formatAjvError,
  isFunction,
  metaOrTypeMapper,
  mem
} from './U'

import M from './'

const getInnerSchema = metadata => M.getSchema(metadata, false)

export default mem((ajv = {validate: T}) => {
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
    wrappedNumber,
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

  const _ajvImpl = (Type, innerMetadata, schema, topLevel) => {
    const metadata = _(Type, innerMetadata)

    return schema === emptyObject
      ? metadata
      : ajvMeta(metadata, emptyObject, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  const _ajv = mem(Type =>
    mem(innerMetadata =>
      mem(schema =>
        mem(
          topLevel => _ajvImpl(Type, innerMetadata, schema, topLevel),
          () => new Map()
        )
      )
    )
  )

  ajvMetadata._ = (
    Type,
    innerMetadata,
    schema = emptyObject,
    topLevel = false
  ) => _ajv(Type)(innerMetadata)(schema)(topLevel)

  const ajvBaseImpl = (Type, schema, topLevel) => {
    const metadata = base(Type)

    return schema === emptyObject
      ? metadata
      : ajvMeta(metadata, {type: 'object'}, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  const ajvBase = mem(Type =>
    mem(schema =>
      mem(topLevel => ajvBaseImpl(Type, schema, topLevel), () => new Map())
    )
  )

  ajvMetadata.base = (Type, schema = emptyObject, topLevel = false) =>
    ajvBase(Type)(schema)(topLevel)

  const ajvAsIsImpl = (transformer, schema) =>
    ajvMeta(asIs(transformer), schema)

  const ajvAsIs = mem(transformer =>
    mem(schema => ajvAsIsImpl(transformer, schema))
  )

  ajvMetadata.asIs = (transformer, schema) => ajvAsIs(transformer)(schema)
  ajvMetadata.any = schema => ajvMetadata.asIs(identity, schema)

  ajvMetadata.wrappedNumber = mem(schema => {
    const metadata = wrappedNumber()
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
  })

  ajvMetadata.number = mem(schema =>
    ajvMeta(number(), {type: 'number'}, schema)
  )

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

  const ajvEnumMapImpl = (keyMetadata, valueMetadata, schema) => {
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

  const ajvEnumMap = mem(keyMetadata =>
    mem(valueMetadata =>
      mem(schema => ajvEnumMapImpl(keyMetadata, valueMetadata, schema))
    )
  )

  ajvMetadata.enumMap = (keyMetadata, valueMetadata, schema) =>
    ajvEnumMap(keyMetadata)(valueMetadata)(schema)

  const ajvListImpl = (itemMetadata, schema) =>
    ajvMeta(list(itemMetadata), {type: 'array'}, schema, () => ({
      items: getInnerSchema(itemMetadata)
    }))

  const ajvList = mem(itemMetadata =>
    mem(schema => ajvListImpl(itemMetadata, schema))
  )

  const ajvTupleImpl = (itemsMetadata, schema) => {
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

  const ajvTuple = mem(itemsMetadata =>
    mem(schema => ajvTupleImpl(itemsMetadata, schema))
  )

  ajvMetadata.list = (itemMetadata, schema) =>
    Array.isArray(itemMetadata)
      ? ajvTuple(itemMetadata)(schema)
      : ajvList(itemMetadata)(schema)

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

  const ajvStringMapImpl = (valueMetadata, schema) =>
    ajvMeta(stringMap(valueMetadata), {type: 'object'}, schema, () => ({
      additionalProperties: false,
      patternProperties: {
        '.*': getInnerSchema(valueMetadata)
      }
    }))

  const ajvStringMap = mem(valueMetadata =>
    mem(schema => ajvStringMapImpl(valueMetadata, schema))
  )

  ajvMetadata.stringMap = (valueMetadata, schema) =>
    ajvStringMap(valueMetadata)(schema)

  const ajvSetImpl = (itemMetadata, schema) =>
    ajvMeta(
      set(itemMetadata),
      {
        type: 'array',
        uniqueItems: true
      },
      schema,
      () => ({items: getInnerSchema(itemMetadata)})
    )

  const ajvSet = mem(itemMetadata =>
    mem(schema => ajvSetImpl(itemMetadata, schema))
  )

  ajvMetadata.set = (itemMetadata, schema) => ajvSet(itemMetadata)(schema)

  const ajvMaybeImpl = (itemMetadata, schema) =>
    ajvMeta(maybe(itemMetadata), emptyObject, schema, () =>
      getInnerSchema(itemMetadata)
    )

  const ajvMaybe = mem(itemMetadata =>
    mem(schema => ajvMaybeImpl(itemMetadata, schema))
  )

  ajvMetadata.maybe = (itemMetadata, schema) => ajvMaybe(itemMetadata)(schema)

  const ajvWithDefaultImpl = (itemMetadata, def, schema) =>
    ajvMeta(withDefault(itemMetadata, def), emptyObject, schema, () =>
      getInnerSchema(itemMetadata)
    )

  const ajvWithDefault = mem(itemMetadata =>
    mem(
      def => mem(schema => ajvWithDefaultImpl(itemMetadata, def, schema)),
      () => new Map()
    )
  )

  ajvMetadata.withDefault = (itemMetadata, def, schema) =>
    ajvWithDefault(itemMetadata)(def)(schema)

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
})
