import {always, asIsReviver, identity} from '../U'

export default always(
  Object.freeze({
    type: identity,
    reviver: asIsReviver(identity),
    default: null
  })
)
