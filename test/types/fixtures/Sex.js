/* eslint-env mocha */

import memoise from './memoise'

export default memoise(M => {
  class Sex extends M.Enum {
    static innerTypes () {
      return M.Enum.innerTypes()
    }
  }

  return M.Enum.fromArray([
    'FEMALE', 'MALE', 'OTHER'
  ], Sex, 'Sex')
})
