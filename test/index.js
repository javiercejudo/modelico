'use strict';

const Should = require('should');

const modelicoSpec = require('../dist/modelico-spec.js');
const modelicoSpecES2015 = require('../dist/modelico-spec.es2015.js');

const Modelico = require('../dist/modelico.js');
const ModelicoMin = require('../dist/modelico.min.js');

const ModelicoES2015 = require('../dist/modelico.es2015.js');
const ModelicoMinES2015 = require('../dist/modelico.es2015.min.js');

describe('Modelico Dev (standard setup)', modelicoSpec({}, Should, Modelico));
describe('Modelico Min (standard setup)', modelicoSpec({}, Should, ModelicoMin));

describe('Modelico Dev (ES2015 setup)', modelicoSpecES2015({}, Should, ModelicoES2015));
describe('Modelico Min (ES2015 setup)', modelicoSpecES2015({}, Should, ModelicoMinES2015));
