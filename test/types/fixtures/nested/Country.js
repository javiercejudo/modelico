/* eslint-env mocha */

export default (M, Region) => {
  const { _, string } = M.metadata

  class Country extends M.Base {
    constructor (fields) {
      super(Country, fields)

      return Object.freeze(this)
    }

    static innerTypes (depth) {
      return Object.freeze({
        name: string(),
        code: string(),
        region: _(Region, depth)
      })
    }
  }

  return Object.freeze(Country)
}
