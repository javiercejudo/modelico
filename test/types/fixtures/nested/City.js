/* eslint-env mocha */

export default (M, Region, countryFactory) => {
  const Country = countryFactory(M, Region)
  const { _, string } = M.metadata()

  class City extends M.createModel(path => ({
    name: string(),
    country: _(Country, path)
  })) {
    constructor (props) {
      super(City, props)
    }
  }

  return Object.freeze(City)
}
