import { asIsReviver, identity } from './U'

export default (Type = identity) =>
  Object.freeze({type: Type, reviver: asIsReviver(Type)})
