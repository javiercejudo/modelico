import M from './'

export default (instance, innerMetadata = []) => {
  if (!(instance instanceof M.Base)) {
    throw TypeError(
      'Modelico.validate only works with instances of Modelico.Base'
    )
  }

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
