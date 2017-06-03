export default ({M, Ajv, validationEnabled, ajvOptions}) => {
  const {base, meta} = M.ajvMetadata(
    validationEnabled ? Ajv(ajvOptions) : undefined
  )

  const pad0 = n => {
    const nStr = '' + n

    return n < 10 ? '0' + nStr : nStr
  }

  const reviver = (k, v) => LocalDate.of(...v.split('-').map(Number))

  class LocalDate extends M.Base {
    constructor(props) {
      super(LocalDate, props)

      this.year = () => props.year
      this.month = () => props.month
      this.day = () => props.day

      Object.freeze(this)
    }

    toJSON() {
      const {year, month, day} = this
      const monthAndDay = [month(), day()].map(pad0)

      return [year()].concat(monthAndDay).join('-')
    }

    static of(year, month, day) {
      return new LocalDate({year, month, day})
    }

    static metadata() {
      const baseMetadata = Object.assign({}, base(LocalDate), {reviver})

      // baseMetadata as a function for testing purposes
      return meta(() => baseMetadata, {
        type: 'string',
        pattern: '^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$'
      })
    }
  }

  return LocalDate
}
