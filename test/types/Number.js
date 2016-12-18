/* eslint-env mocha */

export default (should, M) => () => {
  const { number } = M.metadata

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      (() => M.Number(5)).should.throw()
    })
  })

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      (() => M.Number.of(null))
        .should.throw()
    })

    it('should set numbers correctly', () => {
      const numberA = M.Number.of(2)
      const numberB = numberA.setPath([], 5)

      should(numberA.inner())
        .be.exactly(2)

      should(numberB.inner())
        .be.exactly(5)
    })

    it('should not support the set operation', () => {
      const myNumber = M.Number.of(55);

      (() => myNumber.set())
        .should.throw()
    })

    it('should not support the setPath operation with non-empty paths', () => {
      const myNumber = M.Number.of(5);

      (() => myNumber.setPath([0], 7))
        .should.throw()
    })
  })

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const myNumber = M.Number.of(21)

      JSON.stringify(myNumber).should.be.exactly('21')
    })

    it('should support -0', () => {
      const myNumber = M.Number.of(-0)

      JSON.stringify(myNumber).should.be.exactly('"-0"')
    })

    it('should support Infinity', () => {
      const myNumber = M.Number.of(Infinity)

      JSON.stringify(myNumber).should.be.exactly('"Infinity"')
    })

    it('should support -Infinity', () => {
      const myNumber = M.Number.of(-Infinity)

      JSON.stringify(myNumber).should.be.exactly('"-Infinity"')
    })

    it('should support NaN', () => {
      const myNumber = M.Number.of(NaN)

      JSON.stringify(myNumber).should.be.exactly('"NaN"')
    })
  })

  describe('parsing', () => {
    it('should parse values correctly', () => {
      const myNumber = JSON.parse('2', number(true).reviver)

      should(myNumber.inner()).be.exactly(2)
    })

    it('should not support null (wrap with Maybe)', () => {
      (() => JSON.parse(
        'null',
        number(true).reviver
      )).should.throw()
    })

    it('should support -0', () => {
      const myNumber = JSON.parse('"-0"', number(true).reviver)

      Object.is(myNumber.inner(), -0).should.be.exactly(true)
    })

    it('should support Infinity', () => {
      const myNumber = JSON.parse('"Infinity"', number(true).reviver)

      Object.is(myNumber.inner(), Infinity).should.be.exactly(true)
    })

    it('should support -Infinity', () => {
      const myNumber = JSON.parse('"-Infinity"', number(true).reviver)

      Object.is(myNumber.inner(), -Infinity).should.be.exactly(true)
    })

    it('should support NaN', () => {
      const myNumber = JSON.parse('"NaN"', number(true).reviver)

      Object.is(myNumber.inner(), NaN).should.be.exactly(true)
    })
  })
}
