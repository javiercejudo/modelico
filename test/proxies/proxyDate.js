'use strict';

module.exports = (should, M) => () => {
  const p = M.proxyDate;

  it('getters / setters', () => {
    const date1 = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

    const date2 = date1.setFullYear(2015);
    const date3 = date2.setMinutes(55);

    date2.getFullYear()
      .should.be.exactly(2015);

    date1.getFullYear()
      .should.be.exactly(1988);

    date1.getMinutes()
      .should.be.exactly(0);

    date3.getMinutes()
      .should.be.exactly(55);
  });
};
