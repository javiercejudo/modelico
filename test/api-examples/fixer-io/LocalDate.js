export default ({M, Ajv, validationEnabled, ajvOptions}) => {
  const {
    base, ajvMeta
  } = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined)

  const reviver = (k, v) =>
    new LocalDate(...v.split('-').map(Number))

  class LocalDate extends M.Base {
    constructor (year, month, day) {
      super(LocalDate, {year, month, day})

      this.year = () => year
      this.month = () => month
      this.day = () => day

      Object.freeze(this)
    }

    toJSON () {
      const { year, month, day } = this

      return `${year()}-${month()}-${day()}`
    }

    static innerTypes () {
      return Object.freeze({})
    }

    static metadata () {
      const baseMetadata = Object.assign({}, base(LocalDate), {reviver})

      return ajvMeta(baseMetadata, {
        type: 'string',
        pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
      })
    }
  }

  return LocalDate
}
