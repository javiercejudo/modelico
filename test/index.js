/* eslint-env mocha */

'use strict'

var Should = require('should')

var modelicoSpec = require('../dist/modelico-spec.js')

var Modelico = require('../dist/modelico.js')
var ModelicoMin = require('../dist/modelico.min.js')

describe('Modelico', () => {
  describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico))
  describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin))
})
