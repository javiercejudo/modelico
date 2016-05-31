'use strict';

const get = field => obj => obj[field];
const pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));

export const pipe = (...fns) => fns.reduce(pipe2);
export const partial = (fn, ...args) => fn.bind(undefined, ...args);
export const asIsReviver = (k, v) => v;
export const always = x => () => x;
export const defaultTo = fallback => optional => (optional === undefined) ? fallback : optional;
export const objToArr = obj => Object.keys(obj).map(k => [k, obj[k]]);
export const reviverOrAsIs = pipe2(get('reviver'), defaultTo(asIsReviver));
export const isPlainObject = x => typeof x === 'object' && !!x;
