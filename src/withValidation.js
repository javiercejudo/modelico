const defaultErrorMsgFn = (x, path) => `Invalid value at "${path.join(' → ')}"`

export default (validateFn, errorMsgFn = defaultErrorMsgFn) => metadata => {
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

  return Object.assign({}, metadata, {reviver})
}
