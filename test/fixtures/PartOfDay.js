/*jshint node:true, esnext:true */

'use strict';

const range = (minTime, maxTime) => ({minTime, maxTime});

module.exports = M => {
  return M.enumFactory({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
};
