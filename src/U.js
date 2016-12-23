// @flow

const get = (field/* : string */) => (obj/* : Object */) => obj[field]
const pipe2 = (fn1/* : Function */, fn2/* : Function */) => (...args/* : Array<mixed> */) => fn2(fn1(...args))
const not = (x/* : boolean */)/* : boolean */ => !x

export const identity = /* :: <T> */(x/* : T */)/* : T */ => x
export const pipe = (...fns/* : Array<Function> */) => fns.reduce(pipe2, identity)
export const partial = (fn/* : Function */, ...args/* : Array<mixed> */) => fn.bind(undefined, ...args)
export const asIsReviver = (Type/* : Function */) => (k/* : string */, v/* : mixed */) => Type(v)
export const always = /* :: <T> */(x/* : T */) => ()/* : T */ => x
export const isNothing = (v/* : mixed */)/* : boolean */ => v == null || Number.isNaN(v)
export const isSomething = pipe2(isNothing, not)
export const defaultTo = (d/* : mixed */) => (v/* : mixed */) => isNothing(v) ? d : v
export const objToArr = (obj/* : Object */) => Object.keys(obj).map(k => [k, obj[k]])
export const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver(identity)))
export const isPlainObject = (x/* : mixed */)/* : boolean */ => typeof x === 'object' && !!x
export const emptyObject = Object.freeze({})

export const haveSameValues = (a/* : any */, b/* : any */)/* : boolean */ =>
  (a === b) || Object.is(a, b)

export const haveSameType = (a/* : any */, b/* : any */)/* : boolean */ => (a == null || b == null)
  ? a === b
  : a.constructor === b.constructor

export const haveDifferentTypes = pipe2(haveSameType, not)

export const getInnerTypes = (depth/* : number */, Type/* : Function */) => {
  if (!Type.innerTypes) {
    throw Error(`missing static innerTypes for ${Type.displayName || Type.name}`)
  }

  return Type.innerTypes(depth + 1, Type)
}

export const unsupported = (message/* : string */) => {
  throw Error(message)
}
