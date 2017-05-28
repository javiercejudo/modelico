/* eslint-env mocha */

export default M => {
  const {_, string, maybe} = M.metadata()

  class Friend extends M.Base {
    constructor(props) {
      super(Friend, props)
    }

    static innerTypes() {
      return Object.freeze({
        name: string(),
        bestFriend: maybe(_(Friend))
      })
    }
  }

  Friend.EMPTY = new Friend({
    name: '',
    bestFriend: M.Nothing
  })

  return Object.freeze(Friend)
}
