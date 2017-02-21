/* eslint-env mocha */
export default (should, M, fixtures, { Ajv }) => () => {
  const { base, number, ajvAny, ajvNumber } = M.ajvMetadata(Ajv())

  it('should revive as usual with valid JSON', () => {
    const customReviver = baseReviver => (k, v, path = []) => {
      if (k !== '') {
        return v
      }

      if (v.min > v.max) {
        throw RangeError('"min" must be less than or equal to "max"')
      }

      return baseReviver(k, v, path)
    }

    class Range extends M.Base {
      constructor ({ min = -Infinity, max = Infinity } = {}) {
        super(Range, { min, max })
      }

      length () {
        return this.max() - this.min()
      }

      static innerTypes () {
        return Object.freeze({
          min: number(),
          max: number()
        })
      }

      static metadata () {
        const baseMetadata = base(Range)
        const baseReviver = baseMetadata.reviver

        return Object.assign({}, baseMetadata, { reviver: customReviver(baseReviver) })
      }
    }

    M.fromJS(Range, { min: 4, max: 6.5 })
      .length().should.be.exactly(2.5)

    should(() => M.fromJS(Range, { min: 4, max: 3.5 }))
      .throw('"min" must be less than or equal to "max"')

    const validRange = new Range({ min: 0, max: 5 })
    const invalidRange = validRange.set('max', -5)

    M.validate(validRange)[0]
      .should.be.exactly(true)

    const invalidRangeValidationResult = M.validate(invalidRange)

    invalidRangeValidationResult[0]
      .should.be.exactly(false)

    invalidRangeValidationResult[1].message
      .should.be.exactly('"min" must be less than or equal to "max"')

    M.validate(M.List.of(3, 2), [ajvNumber()])[0]
      .should.be.exactly(true)

    const listWithMixedData = M.List.of(3, 'a')

    M.validate(listWithMixedData, [ajvAny()])[0]
      .should.be.exactly(true)

    M.validate(listWithMixedData, [ajvNumber()])[0]
      .should.be.exactly(false)

    M.validate(listWithMixedData, [ajvNumber()])[1].message
      .should.match(/should be number/)
  })
}
