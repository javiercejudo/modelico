/* global modelicoSpec, Should, Modelico */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function () {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin))
})
