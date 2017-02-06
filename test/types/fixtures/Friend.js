/* eslint-env mocha */

export default M => {
  const { _, string, maybe } = M.metadata()

  class Friend extends M.createModel(path => ({
    name: string(),
    bestFriend: maybe(_(Friend, path))
  })) {
    constructor (props) {
      super(Friend, props)
    }
  }

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Maybe.EMPTY
  })

  return Object.freeze(Friend)
}
