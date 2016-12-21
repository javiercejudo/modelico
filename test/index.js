/* eslint-env mocha */

'use strict'

var Should = require('should')
var Immutable = require('immutable')

var modelicoSpec = require('../dist/modelico-spec.js')

var Modelico = require('../dist/modelico.js')
var ModelicoMin = require('../dist/modelico.min.js')

describe('Modelico', () => {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico, Immutable))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin, Immutable))
})
