/* eslint-env mocha */

export default (M, Region, countryFactory) => {
  const Country = countryFactory(M, Region)
  const {_, string} = M.metadata()

  class City extends M.Base {
    static innerTypes() {
      return Object.freeze({
        name: string(),
        country: _(Country)
      })
    }
  }

  return Object.freeze(City)
}
