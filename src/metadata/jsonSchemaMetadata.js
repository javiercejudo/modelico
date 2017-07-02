import {
  identity,
  always,
  emptyObject,
  isFunction,
  metaOrTypeMapper,
  mem
} from '../U'

import M from '../'

const getInnerSchema = metadata => M.getSchema(metadata, false)
const alwaysEmptyString = always('')
const triviallyValidResult = [true, alwaysEmptyString]

const jsonSchemaMetadata = validate => {
  const getSchema = M.getSchema
  const metadata = M.metadata()
  const jscMetadata = {}

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

    const validationResult = schema === emptyObject
      ? triviallyValidResult
      : validate(schema, valueTransformer(value), path)

    if (!validationResult[0]) {
      throw TypeError(validationResult[1]())
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

  const jscMeta = (
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

  jscMetadata.meta = jscMeta

  const _jscImpl = (Type, innerMetadata, schema, topLevel) => {
    const metadata = _(Type, innerMetadata)

    return schema === emptyObject
      ? metadata
      : jscMeta(metadata, emptyObject, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  const _jsc = mem(Type =>
    mem(innerMetadata =>
      mem(schema =>
        mem(
          topLevel => _jscImpl(Type, innerMetadata, schema, topLevel),
          () => new Map()
        )
      )
    )
  )

  jscMetadata._ = (
    Type,
    innerMetadata,
    schema = emptyObject,
    topLevel = false
  ) => _jsc(Type)(innerMetadata)(schema)(topLevel)

  const jscBaseImpl = (Type, schema, topLevel) => {
    const metadata = base(Type)

    return schema === emptyObject
      ? metadata
      : jscMeta(metadata, {type: 'object'}, schema, () =>
          getSchema(metadata, topLevel)
        )
  }

  const jscBase = mem(Type =>
    mem(schema =>
      mem(topLevel => jscBaseImpl(Type, schema, topLevel), () => new Map())
    )
  )

  jscMetadata.base = (Type, schema = emptyObject, topLevel = false) =>
    jscBase(Type)(schema)(topLevel)

  const jscAsIsImpl = (transformer, schema) =>
    jscMeta(asIs(transformer), schema)

  const jscAsIs = mem(transformer =>
    mem(schema => jscAsIsImpl(transformer, schema))
  )

  jscMetadata.asIs = (transformer, schema) => jscAsIs(transformer)(schema)
  jscMetadata.any = mem(schema => jscMeta(any(), schema))

  jscMetadata.wrappedNumber = mem(schema => {
    const metadata = wrappedNumber()
    const numberMeta = Object.assign({type: 'number'}, schema)

    const baseSchema = {
      anyOf: [{type: 'number'}, {enum: ['-0', '-Infinity', 'Infinity', 'NaN']}]
    }

    const reviver = ensureWrapped(metadata, baseSchema, numberMeta)

    return Object.assign({}, metadata, {
      reviver,
      ownSchema: always(baseSchema),
      schema: always(baseSchema)
    })
  })

  jscMetadata.number = mem(schema =>
    jscMeta(number(), {type: 'number'}, schema)
  )

  jscMetadata.string = mem(schema =>
    jscMeta(string(), {type: 'string'}, schema)
  )

  jscMetadata.boolean = mem(schema =>
    jscMeta(boolean(), {type: 'boolean'}, schema)
  )

  jscMetadata.date = mem(schema =>
    jscMeta(date(), {type: 'string', format: 'date-time'}, schema)
  )

  jscMetadata._enum = mem(Type => {
    const metadata = _(Type)

    return jscMeta(metadata, {
      enum: Object.keys(metadata.enumerators)
    })
  })

  const jscEnumMapImpl = (keyMetadata, valueMetadata, schema) => {
    const enumeratorsKeys = Object.keys(keyMetadata.enumerators)
    const keysRegex = `^(${enumeratorsKeys.join('|')})$`

    return jscMeta(
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

  const jscEnumMap = mem(keyMetadata =>
    mem(valueMetadata =>
      mem(schema => jscEnumMapImpl(keyMetadata, valueMetadata, schema))
    )
  )

  jscMetadata.enumMap = (keyMetadata, valueMetadata, schema) =>
    jscEnumMap(keyMetadata)(valueMetadata)(schema)

  const jscListImpl = (itemMetadata, schema) =>
    jscMeta(list(itemMetadata), {type: 'array'}, schema, () => ({
      items: getInnerSchema(itemMetadata)
    }))

  const jscList = mem(itemMetadata =>
    mem(schema => jscListImpl(itemMetadata, schema))
  )

  const jscTupleImpl = (itemsMetadata, schema) => {
    const length = itemsMetadata.length

    return jscMeta(
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

  const jscTuple = mem(itemsMetadata =>
    mem(schema => jscTupleImpl(itemsMetadata, schema))
  )

  jscMetadata.list = (itemMetadata, schema) =>
    Array.isArray(itemMetadata)
      ? jscTuple(itemMetadata)(schema)
      : jscList(itemMetadata)(schema)

  const jscMapImpl = (keyMetadata, valueMetadata, schema) => {
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

    return jscMeta(
      map(keyMetadata, valueMetadata),
      baseSchema,
      schema,
      keyValueSchemaGetter
    )
  }

  const jscMap = mem(keyMetadata =>
    mem(valueMetadata =>
      mem(schema => jscMapImpl(keyMetadata, valueMetadata, schema))
    )
  )

  jscMetadata.map = (keyMetadata, valueMetadata, schema) =>
    jscMap(keyMetadata)(valueMetadata)(schema)

  const jscStringMapImpl = (valueMetadata, schema) => {
    const baseSchema = {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '.*': emptyObject
      }
    }

    const combinedSchema = Object.assign(baseSchema, schema)
    const propertiesPattern = Object.keys(combinedSchema.patternProperties)[0]

    return jscMeta(stringMap(valueMetadata), combinedSchema, undefined, () => ({
      patternProperties: {
        [propertiesPattern]: getInnerSchema(valueMetadata)
      }
    }))
  }

  const jscStringMap = mem(valueMetadata =>
    mem(schema => jscStringMapImpl(valueMetadata, schema))
  )

  jscMetadata.stringMap = (valueMetadata, schema) =>
    jscStringMap(valueMetadata)(schema)

  const jscSetImpl = (itemMetadata, schema) =>
    jscMeta(
      set(itemMetadata),
      {
        type: 'array',
        uniqueItems: true
      },
      schema,
      () => ({items: getInnerSchema(itemMetadata)})
    )

  const jscSet = mem(itemMetadata =>
    mem(schema => jscSetImpl(itemMetadata, schema))
  )

  jscMetadata.set = (itemMetadata, schema) => jscSet(itemMetadata)(schema)

  const jscMaybeImpl = (itemMetadata, schema) =>
    jscMeta(maybe(itemMetadata), emptyObject, schema, () =>
      getInnerSchema(itemMetadata)
    )

  const jscMaybe = mem(itemMetadata =>
    mem(schema => jscMaybeImpl(itemMetadata, schema))
  )

  jscMetadata.maybe = (itemMetadata, schema) => jscMaybe(itemMetadata)(schema)

  const jscWithDefaultImpl = (itemMetadata, def, schema) =>
    jscMeta(withDefault(itemMetadata, def), emptyObject, schema, () =>
      getInnerSchema(itemMetadata)
    )

  const jscWithDefault = mem(itemMetadata =>
    mem(
      def => mem(schema => jscWithDefaultImpl(itemMetadata, def, schema)),
      () => new Map()
    )
  )

  jscMetadata.withDefault = (itemMetadata, def, schema) =>
    jscWithDefault(itemMetadata)(def)(schema)

  jscMetadata.anyOf = (conditionedMetas, enumField) =>
    jscMeta(anyOf(conditionedMetas, enumField), {
      anyOf: conditionedMetas.map(conditionMeta =>
        getInnerSchema(conditionMeta[0])
      )
    })

  jscMetadata.union = (Type, metasOrTypes, classifier) => {
    const metas = metasOrTypes.map(metaOrTypeMapper(_))
    const baseMetadata = union(Type, metas, classifier)

    return jscMeta(baseMetadata, emptyObject, emptyObject, () => ({
      // The classifier might determine how multiple matches resolve, hence the
      // use of anyOf instead of oneOf. Ambiguities will still be caught.
      anyOf: metas.map(getInnerSchema)
    }))
  }

  return Object.freeze(Object.assign({}, metadata, jscMetadata))
}

export default mem((validate = () => triviallyValidResult) =>
  jsonSchemaMetadata(validate)
)
