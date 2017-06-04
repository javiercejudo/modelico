/* eslint-env mocha */
export default (should, M, fixtures, {isMyJsonValid}) => () => {
  describe('can use arbitrary JSON schema implementations', () => {
    let m

    beforeEach(() => {
      const validate = (schema, value) => {
        const validate = isMyJsonValid(schema)
        const formatError = path =>
          [
            `Invalid JSON at "${path.join(' -> ')}". The value`,
            JSON.stringify(value),
            ...validate.errors.map(err => `${err.message}`)
          ].join('\n')

        return [validate(value), formatError]
      }

      m = M.jsonSchemaMetadata(validate)
    })

    it('validates conforming data', () => {
      m.string({maxLength: 5}).reviver('', 'test').should.be.exactly('test')
    })

    it('rejects non-conforming data', () => {
      should(() =>
        m.string({maxLength: 5}).reviver('', 'some long string')
      ).throw(/has longer length than allowed/)
    })
  })

  describe('... or no implementation at all', () => {
    let m

    beforeEach(() => {
      m = M.jsonSchemaMetadata()
    })

    it('validates conforming data', () => {
      m.string({maxLength: 5}).reviver('', 'test').should.be.exactly('test')
    })

    it('does not reject non-conforming data', () => {
      m
        .string({maxLength: 5})
        .reviver('', 'some long string')
        .should.be.exactly('some long string')
    })
  })
}
