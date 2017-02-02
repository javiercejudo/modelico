/* global modelicoSpec, Should, Modelico, Ajv */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function () {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico, { Ajv: Ajv }))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin, { Ajv: Ajv }))
})
