export default ({M, Ajv, validationEnabled, ajvOptions}) => {
  const {
    base, ajvMeta
  } = M.ajvMetadata(validationEnabled ? Ajv(ajvOptions) : undefined)

  const reviver = (k, v) =>
    new LocalDate(...v.split('-').map(Number))

  class LocalDate extends M.Base {
    constructor (year, month, day) {
      super({year, month, day}, LocalDate)

      this.year = () => year
      this.month = () => month
      this.day = () => day

      Object.freeze(this)
    }

    toJSON () {
      const { year, month, day } = this

      return `${year()}-${month()}-${day()}`
    }

    static metadata () {
      const baseMetadata = Object.assign({}, base(LocalDate), {reviver})

      // baseMetadata as a function for testing purposes
      return ajvMeta(() => baseMetadata, {
        type: 'string',
        pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
      })
    }
  }

  return LocalDate
}
