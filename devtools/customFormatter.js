export default M => {
  const PREVIEW_MAX_LENGTH = 100
  const FIELDS_POSTFIX = '()'

  const isPlainObject = x => typeof x === 'object' && !!x
  const isModelico = obj => obj instanceof M.Base

  const styles = {
    keys: 'color: purple',
    normal: 'color: #444',
    childwrapper: 'margin-left: 15px; padding: 2px 0 1px',
    childObject: 'margin-left: 26px;',
    childNative: 'margin-left: 14px;'
  }

  const getTypeName = type => type.displayName || type.name

  const formatKey = key =>
    ['span', {}].concat([
      ['span', {style: styles.keys}, `${key}`],
      ['span', {style: styles.normal}, ': ']
    ])

  const header = (obj, {key, parentType} = {}) => {
    const objStr = obj.stringify()
    const snippet = objStr.slice(0, PREVIEW_MAX_LENGTH)

    const preview = PREVIEW_MAX_LENGTH > 0 && objStr.length > PREVIEW_MAX_LENGTH
      ? snippet + '...'
      : snippet

    const typeName = getTypeName(obj[M.symbols.typeSymbol]())

    let subtypeNames

    try {
      subtypeNames =
        '<' +
        parentType
          .innerTypes()[key.slice(0, -FIELDS_POSTFIX.length)]
          .subtypes.map(x => getTypeName(x.type))
          .join(', ') +
        '>'
    } catch (ignore) {
      subtypeNames = ''
    }

    const sizeStr = obj.hasOwnProperty('size') ? `(${obj.size}) ` : ' '

    return ['div', {}].concat([
      ['span', {}, key ? formatKey(key) : ''],
      ['span', {}, typeName + subtypeNames + sizeStr],
      ['span', {}, preview]
    ])
  }

  const modelicoChild = (obj, fields, key) => [
    'object',
    {
      object: fields[key],
      config: {
        key: key,
        parentType: obj[M.symbols.typeSymbol]()
      }
    }
  ]

  const nativeChild = (fields, key) =>
    ['div', {style: styles.childNative}].concat([
      formatKey(key),
      ['object', {object: fields[key]}]
    ])

  const withMethods = obj => {
    const json = obj.toJSON()
    const base = isPlainObject(json) ? Object.assign({}, json) : {':': json}

    const res = Object.keys(base).reduce((acc, key) => {
      const keyName = obj instanceof M.List
        ? `get(${key})`
        : key === ':' || Array.isArray(json) ? key : key + FIELDS_POSTFIX

      acc[keyName] = base[key]

      return acc
    }, {})

    return Object.keys(obj).reduce((acc, key) => {
      if (!(key + FIELDS_POSTFIX in res)) {
        res[key] = obj[key]
      }

      return acc
    }, res)
  }

  const body = obj => {
    const fields = withMethods(obj)
    const fieldsKeys = Object.keys(fields)

    let children

    if (fieldsKeys.length === 0) {
      children = [
        ['div', {style: styles.childObject}, ['object', {object: fields}]]
      ]
    } else {
      children = fieldsKeys.sort().reduce((acc, key) => {
        const child = isModelico(fields[key])
          ? modelicoChild(obj, fields, key)
          : nativeChild(fields, key)

        acc.push(['div', {style: styles.childwrapper}, child])

        return acc
      }, [])
    }

    return ['div', {}].concat(children)
  }

  return Object.freeze({
    header: (obj, config) => (isModelico(obj) ? header(obj, config) : null),
    hasBody: isModelico,
    body
  })
}
