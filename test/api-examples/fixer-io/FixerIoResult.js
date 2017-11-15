export default ({M, m}, {Currency, LocalDate}) => {
  const {_, _enum, enumMap, number} = m

  class FixerIoResult extends M.Base {
    constructor(fields) {
      // ensure base is included in the rates
      const rates = fields.rates.set(fields.base, 1)
      const enhancedFields = Object.assign({}, fields, {
        rates
      })

      super(FixerIoResult, enhancedFields)
      Object.freeze(this)
    }

    convert(from, to, x) {
      const rates = this.rates()

      return x * rates.get(to) / rates.get(from)
    }

    static innerTypes() {
      return Object.freeze({
        base: _enum(Currency),
        date: _(LocalDate),
        rates: enumMap(_enum(Currency), number({exclusiveMinimum: 0}))
      })
    }
  }

  return FixerIoResult
}
