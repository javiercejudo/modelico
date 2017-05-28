/* eslint-env mocha */

export default (U, should, M) => () => {
  const {wrappedNumber} = M.metadata()

  describe('instantiation', () => {
    it('must be instantiated with new', () => {
      ;(() => M.Number(5)).should.throw()
    })

    it('should cast using Number', () => {
      should(new M.Number().inner()).be.exactly(0)
      should(new M.Number(2).inner()).be.exactly(2)
      should(new M.Number('2').inner()).be.exactly(2)
      should(new M.Number('-Infinity').inner()).be.exactly(-Infinity)
    })
  })

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      ;(() => M.Number.of(null)).should.throw()
    })

    it('should set numbers correctly', () => {
      const numberA = M.Number.of(2)
      const numberB = numberA.setIn([], 5)

      should(numberA.inner()).be.exactly(2)

      should(numberB.inner()).be.exactly(5)
    })

    it('should not support the set operation', () => {
      const myNumber = M.Number.of(55)
      ;(() => myNumber.set()).should.throw()
    })

    it('should not support the setIn operation with non-empty paths', () => {
      const myNumber = M.Number.of(5)
      ;(() => myNumber.setIn([0], 7)).should.throw()
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
      const myNumber = JSON.parse('2', wrappedNumber().reviver)

      should(myNumber.inner()).be.exactly(2)
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() => JSON.parse('null', wrappedNumber().reviver)).should.throw()
    })

    it('should support -0', () => {
      const myNumber = JSON.parse('"-0"', wrappedNumber().reviver)

      Object.is(myNumber.inner(), -0).should.be.exactly(true)
    })

    it('should support Infinity', () => {
      const myNumber = JSON.parse('"Infinity"', wrappedNumber().reviver)

      Object.is(myNumber.inner(), Infinity).should.be.exactly(true)
    })

    it('should support -Infinity', () => {
      const myNumber = JSON.parse('"-Infinity"', wrappedNumber().reviver)

      Object.is(myNumber.inner(), -Infinity).should.be.exactly(true)
    })

    it('should support NaN', () => {
      const myNumber = JSON.parse('"NaN"', wrappedNumber().reviver)

      Object.is(myNumber.inner(), NaN).should.be.exactly(true)
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoNumber1 = M.Number.of(2)
      const modelicoNumber2 = M.Number.of(2)

      modelicoNumber1.should.not.be.exactly(modelicoNumber2)
      modelicoNumber1.should.not.equal(modelicoNumber2)

      modelicoNumber1.equals(modelicoNumber1).should.be.exactly(true)
      modelicoNumber1.equals(modelicoNumber2).should.be.exactly(true)
      modelicoNumber1.equals(2).should.be.exactly(false)
    })

    it('should have same-value-zero semantics', () => {
      M.Number.of(0).equals(M.Number.of(-0)).should.be.exactly(true)
      M.Number.of(NaN).equals(M.Number.of(NaN)).should.be.exactly(true)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString
        .call(M.Number.of(1))
        .should.be.exactly('[object ModelicoNumber]')
    })
  })
}
