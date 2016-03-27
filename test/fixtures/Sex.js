/*jshint node:true, esnext:true */

'use strict';

const Enum = require('../../').Enum;

const FEMALE = {code: 'FEMALE'};
const MALE = {code: 'MALE'};

const values = new Enum({FEMALE, MALE});

class Sex extends Enum {
  static values() {
    return values;
  }

  static reviver(k, v) {
    if (v === null) {
      return null;
    }
    
    return values[v];
  }
}

module.exports = Sex;
