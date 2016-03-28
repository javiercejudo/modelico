/*jshint node:true, esnext:true */

'use strict';

const enumFactory = require('../../').enumFactory;

const range = (min, max) => {
  return {minTime: min, maxTime: max};
};

const PartOfDay = enumFactory({
  ANY: range(0, 1440),
  MORNING: range(0, 720),
  AFTERNOON: range(720, 1080),
  EVENING: range(1080, 1440)
});

module.exports = PartOfDay;
