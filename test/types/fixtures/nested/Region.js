/* eslint-env mocha */

import memoise from '../memoise'

export default memoise(M => {
  const { string } = M.metadata

  class Region extends M.Base {
    constructor (fields) {
      super(Region, fields)

      return Object.freeze(this)
    }

    customMethod () {
      return `${this.name()} (${this.code()})`
    }

    static innerTypes () {
      return Object.freeze({
        name: string(),
        code: string()
      })
    }
  }

  return Object.freeze(Region)
})
