/* eslint-env mocha */

export default M => {
  const {_, number, string} = M.metadata()

  class Code extends M.Base {
    constructor(props) {
      super(Code, props)
    }

    static innerTypes() {
      return Object.freeze({
        id: number(),
        value: string()
      })
    }
  }

  class Region extends M.Base {
    constructor(props) {
      super(Region, props)
    }

    customMethod() {
      return `${this.name()} (${this.code().value()})`
    }

    static innerTypes() {
      return Object.freeze({
        name: string(),
        code: _(Code)
      })
    }
  }

  return Object.freeze(Region)
}
