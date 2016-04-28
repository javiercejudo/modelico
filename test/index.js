'use strict';

const Should = require('should');
const Modelico = require('../dist/modelico.js');
const modelicoSpec = require('../dist/modelico-spec.js');

describe('Modelico (Node.js setup)', modelicoSpec({}, Should, Modelico));
