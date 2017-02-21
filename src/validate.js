import M from './'

export default (instance, innerMetadata = []) => {
  try {
    M.genericsFromJSON(
      instance[M.symbols.typeSymbol](),
      innerMetadata,
      JSON.stringify(instance)
    )
  } catch (e) {
    return [false, e]
  }

  return [true, undefined]
}
