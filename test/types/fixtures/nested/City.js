/* eslint-env mocha */

export default (M, Region, countryFactory) => {
  const Country = countryFactory(M, Region)
  const { _, string } = M.metadata

  class City extends M.Base {
    constructor (fields) {
      super(City, fields)

      return Object.freeze(this)
    }

    static innerTypes (depth) {
      return Object.freeze({
        name: string(),
        country: _(Country, depth)
      })
    }
  }

  return Object.freeze(City)
}
