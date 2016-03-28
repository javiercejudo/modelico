/*jshint node:true, esnext:true */

'use strict';

const enumFactory = require('../../').enumFactory;

const Sex = enumFactory(['FEMALE', 'MALE']);

module.exports = Sex;
