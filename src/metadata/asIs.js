import {asIsReviver, identity, pipe, assertSomethingIdentity, mem} from '../U'

export default mem((transformer = identity) =>
  Object.freeze({
    type: transformer,
    reviver: asIsReviver(pipe(assertSomethingIdentity, transformer)),
    maybeReviver: asIsReviver(transformer)
  })
)
