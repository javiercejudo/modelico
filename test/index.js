/* eslint-env mocha */
/* global require */

'use strict'

var Should = require('should')
var Ajv = require('ajv')

var modelicoSpec = require('../dist/modelico-spec.js')
var Modelico = require('../dist/modelico.js')

describe(
  'Modelico',
  modelicoSpec({
    Should: Should,
    Modelico: Modelico,
    extensions: {
      Ajv: Ajv
    }
  })
)
