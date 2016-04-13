'use strict';

const U = require('./U');

module.exports = type => Object.freeze({type: type, reviver: U.asIsReviver});
