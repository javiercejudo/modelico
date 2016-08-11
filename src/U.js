// @flow

'use strict';

const get = (field: string) => (obj: Object) => obj[field];
const pipe2 = (fn1: Function, fn2: Function) => (...args: Array<mixed>) => fn2(fn1(...args));

export const pipe = (...fns: Array<Function>) => fns.reduce(pipe2);
export const partial = (fn: Function, ...args: Array<mixed>) => fn.bind(undefined, ...args);
export const asIsReviver = (k: string, v: mixed) => v;
export const always = (x: mixed) => () => x;
export const defaultTo = (fallback: mixed) => (optional: mixed) => (optional === undefined) ? fallback : optional;
export const objToArr = (obj: Object) => Object.keys(obj).map(k => [k, obj[k]]);
export const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
export const isPlainObject = (x: mixed) => typeof x === 'object' && !!x;
