/* global modelicoSpec, Should, Modelico, Immutable, Ajv */
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
        Immutable: Immutable
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
        Immutable: Immutable
      }
    })
  )
})
