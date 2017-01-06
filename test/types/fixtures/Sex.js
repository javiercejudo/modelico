/* eslint-env mocha */

export default M => {
  class Sex extends M.Enum {
    static innerTypes () {
      return M.Enum.innerTypes()
    }
  }

  return M.Enum.fromArray([
    'FEMALE', 'MALE', 'OTHER'
  ], Sex, 'Sex')
}
