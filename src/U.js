'use strict';

module.exports = Object.freeze({
  bind: (fn, _1) => fn.bind(undefined, _1),
  default: (optional, fallback) => (optional === undefined) ? fallback : optional
});
