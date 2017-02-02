import { asIsReviver, identity } from './U'

export default (tranformer = identity) =>
  Object.freeze({ type: tranformer, reviver: asIsReviver(tranformer) })
