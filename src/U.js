'use strict';

const asIsReviver = (k, v) => v;

module.exports = Object.freeze({
  bind: (fn, _1) => fn.bind(undefined, _1),
  default: (optional, fallback) => (optional === undefined) ? fallback : optional,
  objToArr: obj => Object.keys(obj).map(k => [k, obj[k]]),
  reviverOrAsIs: metadata => (metadata.reviver || asIsReviver)
});
