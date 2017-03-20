/* eslint-env mocha */

'use strict'

var Should = require('should')
var Immutable = require('immutable')
var Ajv = require('ajv')

var modelicoSpec = require('../dist/modelico-spec.js')

var Modelico = require('../dist/modelico.js')
var ModelicoMin = require('../dist/modelico.min.js')

describe('Modélico', () => {
  describe('Modélico Dev', modelicoSpec({Should: Should, Modelico: Modelico, extensions: {Ajv: Ajv, Immutable: Immutable}}))
  describe('Modélico Min', modelicoSpec({Should: Should, Modelico: ModelicoMin, extensions: {Ajv: Ajv, Immutable: Immutable}}))
})
