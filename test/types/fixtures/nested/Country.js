/* eslint-env mocha */

export default (M, Region) => {
  const { _, string } = M.metadata()

  class Country extends M.Base {
    constructor (props) {
      super(Country, props)
    }

    static innerTypes (path) {
      return Object.freeze({
        name: string(),
        code: string(),
        region: _(Region, path)
      })
    }
  }

  return Object.freeze(Country)
}
