/* eslint-env mocha */

export default M => {
  const { string } = M.metadata()

  class Animal extends M.Base {
    constructor (props) {
      super(Animal, props)
    }

    speak () {
      return 'hello'
    }

    static innerTypes () {
      return Object.freeze({
        name: string()
      })
    }
  }

  return Object.freeze(Animal)
}
