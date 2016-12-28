/* global modelicoSpec, Should, Modelico, Immutable */
/* eslint-env mocha */

'use strict'

var prototypeOfObject = Object.prototype
var toStr = Function.call.bind(prototypeOfObject.toString)

// https://github.com/es-shims/es5-shim/issues#issue/2
// http://ejohn.org/blog/objectgetprototypeof/
// recommended by fschaefer on github
//
// sure, and webreflection says ^_^
// ... this will nerever possibly return null
// ... Opera Mini breaks here with infinite loops
Object.getPrototypeOf = function getPrototypeOf (object) {
  /* eslint-disable no-proto */
  var proto = object.__proto__
  /* eslint-enable no-proto */

  if (proto || proto === null) {
    return proto
  }

  if (toStr(object.constructor) === '[object Function]') {
    return object.constructor.prototype
  }

  if (object instanceof Object) {
    return prototypeOfObject
  }

  // Correctly return null for Objects created with `Object.create(null)`
  // (shammed or native) or `{ __proto__: null}`.  Also returns null for
  // cross-realm objects on browsers that lack `__proto__` support (like
  // IE <11), but that's the best we can do.
  return null
}

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function () {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico, Immutable))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin, Immutable))
})
