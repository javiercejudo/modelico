/* global modelicoSpec, Should, Modelico, Ajv, isMyJsonValid, tv4 */
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
        isMyJsonValid: isMyJsonValid,
        tv4: tv4
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
        isMyJsonValid: isMyJsonValid,
        tv4: tv4
      }
    })
  )
})
