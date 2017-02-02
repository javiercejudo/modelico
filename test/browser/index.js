/* global modelicoSpec, Should, Modelico, Immutable, Ajv */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function () {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico, Immutable, { Ajv: Ajv }))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin, Immutable, { Ajv: Ajv }))
})
