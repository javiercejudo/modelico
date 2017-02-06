/* eslint-env mocha */

export default M => {
  const { string } = M.metadata()

  class Animal extends M.createModel({
    name: string()
  }) {
    constructor (props) {
      super(Animal, props)
    }

    speak () {
      return 'hello'
    }
  }

  return Object.freeze(Animal)
}
