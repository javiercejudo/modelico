/* eslint-env mocha */
/* global require */

'use strict'

var Should = require('should')
var Immutable = require('immutable')
var Ajv = require('ajv')

var modelicoSpec = require('../dist/modelico-spec.js')
var Modelico = require('../dist/modelico.js')

describe('Modelico', () => {
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
})
