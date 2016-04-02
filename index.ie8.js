/*jshint node:true, esnext: true */

'use strict';

// UNTESTED

require('core-js/fn/object/create');
require('core-js/fn/object/define-property');
require('core-js/fn/object/keys');
require('core-js/fn/object/get-own-property-names');
require('core-js/fn/object/get-prototype-of');
require('core-js/fn/object/freeze');

require('core-js/fn/date/to-iso-string');

module.exports = require('./index.es5');
