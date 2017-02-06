/* eslint-env mocha */

export default M => {
  const { string } = M.metadata()

  class Region extends M.createModel({
    name: string(),
    code: string()
  }) {
    constructor (props) {
      super(Region, props)
    }

    customMethod () {
      return `${this.name()} (${this.code()})`
    }
  }

  return Object.freeze(Region)
}
