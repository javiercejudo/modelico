export default (metadata, validateFn, errorMsgFn = ((x, path) => `Invalid value at ${path.join(' > ')}`)) => {
  const reviver = (k, v, path = []) => {
    if (k !== '') {
      return v
    }

    const revivedValue = metadata.reviver('', v, path)

    if (!validateFn(revivedValue)) {
      throw TypeError(errorMsgFn(revivedValue, path))
    }

    return revivedValue
  }

  return Object.assign({}, metadata, { reviver })
}
