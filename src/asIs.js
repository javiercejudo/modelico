import { asIsReviver } from './U'
import Any from './Any'

export default (Type = Any) =>
  Object.freeze({type: Type, reviver: asIsReviver(Type)})
