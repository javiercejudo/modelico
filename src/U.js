// @flow

const get = (field: string) => (obj: Object) => obj[field]
const pipe2 = (f: Function, g: Function) => (...args: Array<mixed>) =>
  g(f(...args))
const not = (x: boolean): boolean => !x

export const T = () => true
export const identity = <T>(x: T): T => x

export const pipe = (...fns: Array<Function>) =>
  [...fns, identity].reduce(pipe2)

export const partial = (fn: Function, ...args: Array<mixed>) =>
  fn.bind(undefined, ...args)

export const asIsReviver = (transform: Function) => (k: string, v: mixed) =>
  transform(v)

export const always = <T>(x: T) => (): T => x

export const isNothing = (v: any): boolean => v == null || Number.isNaN(v)

export const isSomething = pipe2(isNothing, not)

export const assertSomethingIdentity = <T>(x: T): T => {
  if (isNothing(x)) {
    throw TypeError(`expected a value but got nothing (null, undefined or NaN)`)
  }

  return x
}

export const defaultTo = (d: mixed) => (v: mixed) => (isNothing(v) ? d : v)
export const objToArr = (obj: Object) => Object.keys(obj).map(k => [k, obj[k]])

export const reviverOrAsIs = pipe2(
  get('reviver'),
  defaultTo(asIsReviver(assertSomethingIdentity))
)

export const isPlainObject = (x: mixed): boolean => typeof x === 'object' && !!x
export const isFunction = (x: mixed): boolean => typeof x === 'function'
export const emptyObject: Object = Object.freeze({})

export const haveSameValues = (a: any, b: any): boolean =>
  a === b || Object.is(a, b)

export const haveSameType = (a: any, b: any): boolean =>
  a == null || b == null ? a === b : a.constructor === b.constructor

export const haveDifferentTypes = pipe2(haveSameType, not)

export const equals = (a: any, b: any): boolean =>
  isSomething(a) && a.equals ? a.equals(b) : haveSameValues(a, b)

export const unsupported = (message: string) => {
  throw Error(message)
}
