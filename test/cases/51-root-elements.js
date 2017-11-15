/* eslint-env mocha */

export default (should, M) => () => {
  const {string} = M.metadata()

  class Country extends M.Base {
    constructor(code) {
      super(Country, {code})
    }

    static innerTypes() {
      return Object.freeze({
        code: string()
      })
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"')
      .code()
      .should.be.exactly('ESP')
  })
}
