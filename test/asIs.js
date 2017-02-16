/* eslint-env mocha */

export default (U, should, M) => () => {
  const { asIs, any, anyOf, string } = M.metadata()

  describe('toJSON', () => {
    it('should stringify the valfnue as is', () => {
      const mapOfNumbers = M.Map.of('a', 1, 'b', 2)

      JSON.stringify(mapOfNumbers)
        .should.be.exactly('[["a",1],["b",2]]')
    })
  })

  describe('reviver', () => {
    it('should revive the value as is, without the wrapper', () => {
      const asIsObject = JSON.parse('{"two":2}', any().reviver)

      should(asIsObject.two).be.exactly(2)
    })

    it('should support any function', () => {
      const asIsObject = JSON.parse('9', asIs(x => x * 2).reviver)

      should(asIsObject).be.exactly(18)
    })
  })

  describe('metadata', () => {
    it('should return metadata like type', () => {
      string().type.should.be.exactly(String)

      // using empty anyOf for testing purposes
      const asIsObject = JSON.parse('{"two":2}', anyOf()().reviver)

      should(asIsObject.two).be.exactly(2)
    })

    U.skipIfNoObjectFreeze('should be immutable', () => {
      (() => { asIs().reviver = x => x }).should.throw()
    })
  })
}
