/* global modelicoSpec, Should, Modelico, Ajv */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modélico', function() {
  describe(
    'Modélico Dev',
    modelicoSpec({
      Should: Should,
      Modelico: Modelico,
      extensions: {
        Ajv: Ajv
      }
    })
  )
  describe(
    'Modélico Min',
    modelicoSpec({
      Should: Should,
      Modelico: ModelicoMin,
      extensions: {
        Ajv: Ajv
      }
    })
  )
})
