/* eslint-env mocha */

export default (M, Region) => {
  const {_, string} = M.metadata()

  class Country extends M.Base {
    constructor(props) {
      super(Country, props)
    }

    static innerTypes() {
      return Object.freeze({
        name: string(),
        code: string(),
        region: _(Region)
      })
    }
  }

  return Object.freeze(Country)
}
