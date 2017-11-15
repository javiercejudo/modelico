/* eslint-env mocha */
export default (should, M, fixtures, {isMyJsonValid, tv4}) => () => {
  describe('JSON schema implementations (is-my-json-valid)', () => {
    let m

    beforeEach(() => {
      const validate = (schema, value, path) => {
        const implValidate = isMyJsonValid(schema)

        const formatError = () =>
          [
            `Invalid JSON at "${path.join(' → ')}". The value`,
            JSON.stringify(value),
            ...implValidate.errors.map(err => `${err.message}`)
          ].join('\n')

        return [implValidate(value), formatError]
      }

      m = M.jsonSchemaMetadata(validate)
    })

    it('validates conforming data', () => {
      m
        .string({maxLength: 5})
        .reviver('', 'test')
        .should.be.exactly('test')
    })

    it('rejects non-conforming data', () => {
      should(() =>
        m.string({maxLength: 5}).reviver('', 'some long string')
      ).throw(/has longer length than allowed/)
    })
  })

  describe('JSON schema implementations (tv4)', () => {
    let m

    beforeEach(() => {
      const validate = (schema, value, path) => {
        const result = tv4.validateResult(value, schema)

        const formatError = () =>
          [
            `Invalid JSON at "${path.join(' → ')}" for the value`,
            JSON.stringify(value),
            `Error: ${result.error.message}`
          ].join('\n')

        return [result.valid, formatError]
      }

      m = M.jsonSchemaMetadata(validate)
    })

    it('validates conforming data', () => {
      m
        .string({maxLength: 5})
        .reviver('', 'test')
        .should.be.exactly('test')
    })

    it('rejects non-conforming data', () => {
      should(() =>
        m.string({maxLength: 5}).reviver('', 'some long string')
      ).throw(/String is too long/)
    })
  })

  describe('... or no implementation at all', () => {
    let m

    beforeEach(() => {
      m = M.jsonSchemaMetadata()
    })

    it('validates conforming data', () => {
      m
        .string({maxLength: 5})
        .reviver('', 'test')
        .should.be.exactly('test')
    })

    it('does not reject non-conforming data', () => {
      m
        .string({maxLength: 5})
        .reviver('', 'some long string')
        .should.be.exactly('some long string')
    })
  })
}
