export default (
  {M, Ajv, validationEnabled, ajvOptions},
  [Currency, LocalDate]
) => {
  const {
    _, ajvEnum, ajvEnumMap, ajvNumber
  } = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined)

  class FixerIoResult extends M.Base {
    constructor (fields) {
      // ensure base is included in the rates
      const rates = fields.rates.set(fields.base, 1)
      const enhancedFields = Object.assign({}, fields, {rates})

      super(FixerIoResult, enhancedFields)
      Object.freeze(this)
    }

    convert (from, to, x) {
      const rates = this.rates()

      return x * rates.get(to) / rates.get(from)
    }

    static innerTypes () {
      return Object.freeze({
        base: ajvEnum(Currency),
        date: _(LocalDate),
        rates: ajvEnumMap({},
          ajvEnum(Currency),
          ajvNumber({minimum: 0, exclusiveMinimum: true})
        )
      })
    }
  }

  return FixerIoResult
}
