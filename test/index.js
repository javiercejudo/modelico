/*jshint node:true, esnext:true, mocha:true */

'use strict';

const should = require('should');
const M = require('../');

describe('all', require('./allSpec')(should, M));
