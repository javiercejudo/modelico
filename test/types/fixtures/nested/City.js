/* eslint-env mocha */

import memoise from '../memoise'
import CountryFactory from './Country'

export default Region => memoise(M => {
  const Country = CountryFactory(Region)(M)
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
})
