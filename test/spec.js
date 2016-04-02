/*jshint node:true, esnext:true, mocha:true */

'use strict';

const Should = require('should');
const Modelico = require('../');
const modelicoSpec = require('./modelicoSpec');

describe('Modelico', modelicoSpec(Should, Modelico));
