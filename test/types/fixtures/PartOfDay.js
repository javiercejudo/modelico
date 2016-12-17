'use strict';

const range = (minTime, maxTime) => ({minTime, maxTime});

export default M => {
  return M.Enum.fromObject({
    ANY: range(0, 1440),
    MORNING: range(0, 720),
    AFTERNOON: range(720, 1080),
    EVENING: range(1080, 1440)
  });
};
