/* eslint-env mocha */

export default (U, should, M) => () => {
  const {date} = M.metadata()

  describe('immutability', () => {
    it('must not reflect changes in the wrapped input', () => {
      const input = new Date('1988-04-16T00:00:00.000Z')
      const myDate = M.Date.of(input)

      input.setFullYear(2017)

      should(myDate.inner().getFullYear()).be.exactly(1988)
    })
  })

  describe('instantiation', () => {
    it('uses the current date by default', () => {
      const mDate = new M.Date()
      const nativeDate = new Date()

      should(mDate.inner().getFullYear()).be.exactly(nativeDate.getFullYear())

      should(mDate.inner().getMonth()).be.exactly(nativeDate.getMonth())

      should(mDate.inner().getDate()).be.exactly(nativeDate.getDate())
    })

    it('must be instantiated with new', () => {
      ;(() => M.Date()).should.throw()
    })
  })

  describe('setting', () => {
    it('should not support null (wrap with Maybe)', () => {
      should(() => M.Date.of(null)).throw()
    })

    it('should set dates correctly', () => {
      const date1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'))
      const date2 = date1.setIn([], new Date('1989-04-16T00:00:00.000Z'))

      should(date2.inner().getFullYear()).be.exactly(1989)

      should(date1.inner().getFullYear()).be.exactly(1988)
    })

    it('should not support the set operation', () => {
      const myDate = M.Date.of(new Date())
      ;(() => myDate.set()).should.throw()
    })

    it('should not support the setIn operation with non-empty paths', () => {
      const myDate = M.Date.of(new Date())
      ;(() => myDate.setIn([0], new Date())).should.throw()
    })
  })

  describe('stringifying', () => {
    it('should stringify values correctly', () => {
      const myDate = M.Date.of(new Date('1988-04-16T00:00:00.000Z'))

      JSON.stringify(myDate).should.be.exactly('"1988-04-16T00:00:00.000Z"')
    })
  })

  describe('parsing', () => {
    it('should parse Maybe values correctly', () => {
      const myDate = JSON.parse('"1988-04-16T00:00:00.000Z"', date().reviver)

      should(myDate.inner().getFullYear()).be.exactly(1988)
    })

    it('should not support null (wrap with Maybe)', () => {
      ;(() => JSON.parse('null', date().reviver)).should.throw()
    })
  })

  describe('comparing', () => {
    it('should identify equal instances', () => {
      const modelicoDate1 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'))
      const modelicoDate2 = M.Date.of(new Date('1988-04-16T00:00:00.000Z'))

      modelicoDate1.should.not.be.exactly(modelicoDate2)
      modelicoDate1.should.not.equal(modelicoDate2)

      modelicoDate1.equals(modelicoDate1).should.be.exactly(true)
      modelicoDate1.equals(modelicoDate2).should.be.exactly(true)
      modelicoDate1.equals('abc').should.be.exactly(false)
    })
  })

  U.skipIfNoToStringTagSymbol(describe)('toStringTag', () => {
    it('should implement Symbol.toStringTag', () => {
      Object.prototype.toString
        .call(M.Date.of())
        .should.be.exactly('[object ModelicoDate]')
    })
  })
}
