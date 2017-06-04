/* global modelicoSpec, Should, Modelico, Ajv, isMyJsonValid */
/* eslint-env mocha */

'use strict'

var ModelicoMin = Modelico.noConflict()

describe('Modelico', function() {
  describe(
    'Modelico Dev',
    modelicoSpec({
      Should: Should,
      Modelico: Modelico,
      extensions: {
        Ajv: Ajv,
        isMyJsonValid: isMyJsonValid
      }
    })
  )

  describe(
    'Modelico Min',
    modelicoSpec({
      Should: Should,
      Modelico: ModelicoMin,
      extensions: {
        Ajv: Ajv,
        isMyJsonValid: isMyJsonValid
      }
    })
  )
})
