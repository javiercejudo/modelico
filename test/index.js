'use strict';

const Should = require('should');
const Modelico = require('../dist/modelico.js');
const ModelicoMin = require('../dist/modelico.min.js');
const modelicoSpec = require('../dist/modelico-spec.js');

describe('Modelico Dev (Node.js setup)', modelicoSpec({}, Should, Modelico));
describe('Modelico Min (Node.js setup)', modelicoSpec({}, Should, ModelicoMin));
