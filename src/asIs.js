import { asIsReviver, identity, pipe, assertSomethingIdentity } from './U'

export default (transformer = identity) =>
  Object.freeze({
    type: transformer,
    reviver: asIsReviver(pipe(assertSomethingIdentity, transformer)),
    maybeReviver: asIsReviver(transformer)
  })
