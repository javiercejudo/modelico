/*jshint node:true, esnext:true */

'use strict';

const Enum = require('../../').Enum;

const ANY = {minTime: 0, maxTime: 1440};
const MORNING = {minTime: 0, maxTime: 720};
const AFTERNOON = {minTime: 720, maxTime: 1080};
const EVENING = {minTime: 1080, maxTime: 1440};

const values = new Enum({ANY, MORNING, AFTERNOON, EVENING});

class PartOfDay extends Enum {
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

module.exports = PartOfDay;
