'use strict';

import PartOfDayFactory from './fixtures/PartOfDay';

export default (should, M) => () => {
  const PartOfDay = PartOfDayFactory(M);

  describe('keys', () => {
    it('only enumerates the enumerators', () => {
      Object.keys(PartOfDay)
        .should.eql(['ANY', 'MORNING', 'AFTERNOON', 'EVENING']);
    });
  });
};
