/* global modelicoSpec, Should, Modelico, Immutable */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function () {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico, Immutable))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin, Immutable))
})
