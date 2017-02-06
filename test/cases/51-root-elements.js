/* eslint-env mocha */

export default (should, M) => () => {
  const { string } = M.metadata()

  class Country extends M.createModel({
    code: string()
  }) {
    constructor (code) {
      super(Country, {code})
    }
  }

  it('should leave root elements that are not plain objects untouched', () => {
    M.fromJSON(Country, '"ESP"').code()
      .should.be.exactly('ESP')
  })
}
