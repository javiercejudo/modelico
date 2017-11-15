/* eslint-env mocha */
/* global require */

'use strict'

var Should = require('should')
var Ajv = require('ajv')
var isMyJsonValid = require('is-my-json-valid')
var tv4 = require('tv4')
var asciitree = require('asciitree')

var modelicoSpec = require('../dist/modelico-spec.js')
var Modelico = require('../dist/modelico.js')

describe(
  'Modelico',
  modelicoSpec({
    Should: Should,
    Modelico: Modelico,
    extensions: {
      Ajv: Ajv,
      isMyJsonValid: isMyJsonValid,
      tv4: tv4,
      asciitree: asciitree
    }
  })
)
