'use strict';

var Should = require('should');
var jsonSchema = require('jsonschema');

var modelicoSpec = require('../dist/modelico-spec.js');

var Modelico = require('../dist/modelico.js');
var ModelicoMin = require('../dist/modelico.min.js');

var options = {jsonSchema};

describe('Modelico Dev (standard setup)', modelicoSpec(options, Should, Modelico));
describe('Modelico Min (standard setup)', modelicoSpec(options, Should, ModelicoMin));
