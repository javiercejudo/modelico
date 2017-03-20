/* global modelicoSpec, Should, Modelico, Immutable, Ajv */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modélico', function () {
  describe('Modélico Dev', modelicoSpec({Should: Should, Modelico: Modelico, extensions: {Ajv: Ajv, Immutable: Immutable}}))
  describe('Modélico Min', modelicoSpec({Should: Should, Modelico: ModelicoMin, extensions: {Ajv: Ajv, Immutable: Immutable}}))
})
