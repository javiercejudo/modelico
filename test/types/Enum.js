/* eslint-env mocha */

import PartOfDayFactory from './fixtures/PartOfDay'

export default (should, M) => () => {
  const PartOfDay = PartOfDayFactory(M)

  describe('keys', () => {
    it('only enumerates the enumerators', () => {
      Object.keys(PartOfDay)
        .should.eql(['ANY', 'MORNING', 'AFTERNOON', 'EVENING'])
    })
  })

  describe('equals', () => {
    it('should identify equal instances', () => {
      should(PartOfDay.MORNING() === PartOfDay.MORNING())
        .be.exactly(true)

      PartOfDay.MORNING().equals(PartOfDay.MORNING())
        .should.be.exactly(true)

      PartOfDay.MORNING().equals(PartOfDay.EVENING())
        .should.be.exactly(false)
    })
  })
}
