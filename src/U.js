// @flow

'use strict';

const get = (field: string) => { return (obj: Object) => obj[field] };
const pipe2 = (fn1: Function, fn2: Function) => { return (...args: Array<mixed>) => fn2(fn1(...args)) };

export const pipe = (...fns: Array<Function>) => fns.reduce(pipe2);
export const partial = (fn: Function, ...args: Array<mixed>) => fn.bind(undefined, ...args);
// export const is = (Ctor: Object, val: Object) => val != null && val.constructor === Ctor || val instanceof Ctor;
export const asIsReviver = (Type: Function) => { return (k: string, v: mixed) => Type(v) };
export const identity = (x: mixed) => x;
export const always = (x: mixed) => { return () => x };
export const isNothing = (v: mixed) => v == null || v !== v;
export const defaultTo = (d: mixed) => { return (v: mixed) => isNothing(v) ? d : v };
export const objToArr = (obj: Object) => { return Object.keys(obj).map(k => [k, obj[k]]) };
export const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver(identity)));
export const isPlainObject = (x: mixed) => typeof x === 'object' && !!x;

export const unsupported = (message: string = 'Unsupported operation') => {
  throw Error(message);
};
