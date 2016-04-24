'use strict';

const Should = require('should');
const Modelico = require('../');
const modelicoSpec = require('./modelicoSpec');

describe('Modelico (Node.js setup)', modelicoSpec({}, Should, Modelico));
