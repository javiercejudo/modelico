export default (
  {M, Ajv, validationEnabled, ajvOptions},
  [Currency, LocalDate]
) => {
  const ajv = validationEnabled ? Ajv(ajvOptions) : undefined

  class FixerIoResult extends M.createAjvModel(m => ({
    base: m.ajvEnum(Currency),
    date: m._(LocalDate),
    rates: m.ajvEnumMap({},
      m.ajvEnum(Currency),
      m.ajvNumber({minimum: 0, exclusiveMinimum: true})
    )
  }), ajv) {
    constructor (props) {
      // ensure base is included in the rates
      const rates = props.rates.set(props.base, 1)
      const enhancedProps = Object.assign({}, props, {rates})

      super(enhancedProps, FixerIoResult)
      Object.freeze(this)
    }

    convert (from, to, x) {
      const rates = this.rates()

      return x * rates.get(to) / rates.get(from)
    }
  }

  return FixerIoResult
}
