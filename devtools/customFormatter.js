export default M => {
  const PREVIEW_MAX_LENGTH = 100

  const isPlainObject = x => typeof x === 'object' && !!x
  const isModelico = obj => obj instanceof M.Base

  const styles = {
    keys: 'color: purple',
    normal: 'color: #444',
    childwrapper: 'margin-left: 15px; line-height: 1.5',
    childObject: 'margin-left: 26px;',
    childNative: 'margin-left: 14px;'
  }

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

    const typeName = obj[M.symbols.typeSymbol]().name

    let subtypeNames

    try {
      subtypeNames =
        '<' +
        parentType.innerTypes()[key].subtypes.map(x => x.type.name).join(', ') +
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

  const body = obj => {
    const json = obj.toJSON()
    const fields = isPlainObject(json) ? json : {}
    const fieldsKeys = Object.keys(fields)

    let children

    if (fieldsKeys.length === 0) {
      children = [
        ['div', {style: styles.childObject}, ['object', {object: json}]]
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
