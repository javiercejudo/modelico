/* eslint-env mocha */

export default M => {
  const { string } = M.metadata()

  class Region extends M.Base {
    constructor (props) {
      super(Region, props)
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
}
