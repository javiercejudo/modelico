/* eslint-env mocha */

export default (M, Region) => {
  const { _, string } = M.metadata()

  class Country extends M.createModel(path => ({
    name: string(),
    code: string(),
    region: _(Region, path)
  })) {
    constructor (props) {
      super(Country, props)
    }
  }

  return Object.freeze(Country)
}
