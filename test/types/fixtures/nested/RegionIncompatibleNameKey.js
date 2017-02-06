/* eslint-env mocha */

export default M => {
  const { _, number, string } = M.metadata()

  class Code extends M.createModel({
    id: number(),
    value: string()
  }) {
    constructor (props) {
      super(Code, props)
    }
  }

  class Region extends M.createModel(path => ({
    name: string(),
    code: _(Code, path)
  })) {
    constructor (props) {
      super(Region, props)
    }

    customMethod () {
      return `${this.name()} (${this.code().value()})`
    }
  }

  return Object.freeze(Region)
}
