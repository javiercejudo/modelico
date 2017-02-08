/* eslint-env mocha */

export default M => {
  const { _, string, maybe } = M.metadata()

  class Friend extends M.Base {
    constructor (props) {
      super(Friend, props)
    }

    static innerTypes (path) {
      return Object.freeze({
        name: string(),
        bestFriend: maybe(_(Friend, path))
      })
    }
  }

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Maybe.EMPTY
  })

  return Object.freeze(Friend)
}
